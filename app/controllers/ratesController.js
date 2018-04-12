'use strict';
var Rates = require('../util/rates');
var User = require('../models/user');
var Bag = require('../models/bag');
var Quote = require('../models/quote');
var parseString = require('xml2js').parseString;
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  rates: rates,
  getRates: getRates
};

function rates (req, response) {

  var email = req.param('email');
  var token = req.headers.authorization;
  var body = req.body;
  var communeOrigin = body.communeOrigin;
  var communeDestination = body.communeDestination;
  var weight = body.weight;
  var width = body.width;
  var height = body.height;
  var long = body.long;

  var tarCXP = null;
  var tarCDCH = null;

  // verifies secret and checks exp
  jwt.verify(token, config.jwt.secret, function(err, decoded) {
    if (err) {
      response.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
      console.log('INFO: Fallo en la autenticación de Token: ' + err);
    } else {
      // if everything is good, save to request for use in other routes
      req.decoded = decoded;
      User.findOne({email:email}, function (err, user) {
        if (!err && user) {
          if (user.status) {
            Bag.findOne({email:user.email}, function (err, bag) {
              if (!err && bag) {
                  var date = new Date;
                  var expire = new Date(bag.purchased.getFullYear(), bag.purchased.getMonth(), bag.purchased.getDate() + 30);

                  console.log('INFO: Numero de cotizaciones Usuario (' + user.quotes + ') Bolsa (' + bag.numQuote + ')');
                  console.log('INFO: Fecha de compra (' + bag.purchased.getDate() + '/' + parseInt(bag.purchased.getMonth()+1) + '/' + bag.purchased.getFullYear() + ')');
                  console.log('INFO: Fecha HOY (' + date.getDate() + '/' + parseInt(date.getMonth()+1) + '/' + date.getFullYear() + ')');
                  console.log('INFO: Fecha sumada ('+ expire.getDate() + '/' + parseInt(expire.getMonth()+1) + '/' + expire.getFullYear() + ')');

                  if (user.quotes < bag.numQuote || date <= expire) {

                    var callback = function (chunck, tipo) {
                      if (tipo == 'cxp') {
                        console.log('CXP - ' + typeof(chunck));
                        parseString(chunck, function (err, result) {
                          var res = result;
                          tarCXP = res;
                        });
                      } else if (tipo == 'cdch') {
                        console.log('CDCH - ' + typeof(chunck));
                        tarCDCH = chunck;
                      }

                      // Construir respuesta conjunta
                      if (tarCXP && tarCDCH) {
                        services(user, tarCXP, tarCDCH, weight, response);
                      }
                    }

                    // Tarificacion CXP
                    Rates.rateCXP(communeOrigin, communeDestination, weight, width, height, long, callback);

                    // Tarificacion CDCH
                    Rates.rateCDCH(communeOrigin, communeDestination, weight, width, height, long, callback);

                    user.quotes++;
                    user.save(function (err, res) {
                      if (!err) console.log('INFO: Numero de cotizaciones de usuario aumentada (' + user.quotes + ' / ' + bag.numQuote + ')');
                      else console.log('ERROR: aumentar cotizaciones usuario: ' + err);
                    });
                  } else {
                    response.status(202).send({ code: 202, desc: "User can't make more quotes"});
                    console.log("LOG: User can't make more quotes" + err);
                  }
              } else {
                response.status(404).send({ code: 404, desc: 'No bag bought'});
                console.log('LOG: No bag bought');
              }
            }).sort('-purchased');
          } else {
            response.status(202).send({ code: 202, desc: 'User not validated'});
            console.log('LOG: User not validated');
          }
        } else {
          response.status(404).send({ code: 404, desc: "User doesn't exist"});
          console.log("LOG: User doesn't exist");
        }
      });
    }
  });
}

function services (user, tarCXP, tarCDCH, weight, response) {

  if (typeof tarCXP !== 'undefined' && typeof tarCXP.courier !== 'undefined') {
    console.log('******* CXP response Tarification ******');
    console.log(tarCXP.courier.listaServicios[0]);
    console.log('******* END CDCH ******');
    var tarificacion_cxp = {
      codEstado: tarCXP.courier.codEstado[0],
      glsEstado: tarCXP.courier.glsEstado[0],
      servicio: {
        codServicio: tarCXP.courier.listaServicios[0].codServicio[0],
        glsServicio: tarCXP.courier.listaServicios[0].glsServicio[0],
        pesoCalculo: tarCXP.courier.listaServicios[0].pesoCalculo[0],
        valorServicio: tarCXP.courier.listaServicios[0].valorServicio[0]
      }
    }
  } else {
    console.log('******* CXP response Tarification ******');
    console.log('******* SERVICIO DE CHILEXPRESS NO TIENE COBERTURA *******');
    console.log('******* END CDCH ******');
    var tarificacion_cxp = {
      codEstado: '1',
      glsEstado: 'NOK',
      servicio: {
        codServicio: '',
        glsServicio: '',
        pesoCalculo: '',
        valorServicio: ''
      }
    }
  }

  if (typeof tarCDCH !== 'undefined' && typeof tarCDCH.consultaCoberturaResult !== 'undefined') {
    console.log('******* CDCH response Tarification ******');
    console.log(tarCDCH.consultaCoberturaResult.ServicioTO[0]);
    console.log('******* END CDCH ******');
    var tarificacion_cdch = {
      codEstado: '0',
      glsEstado: 'OK',
      servicio:{
        codServicio: tarCDCH.consultaCoberturaResult.ServicioTO[0].CodigoServicio,
        glsServicio: tarCDCH.consultaCoberturaResult.ServicioTO[0].ConceptosTasacion.ConceptoTasacionTO[0].Observaciones,
        pesoCalculo: weight+'',
        valorServicio: tarCDCH.consultaCoberturaResult.ServicioTO[0].TotalTasacion.Total
      }
    }
  } else {
    console.log('******* CDCH response Tarification ******');
    console.log('******* SERVICIO DE CORREOS DE CHILE NO TIENE COBERTURA *******');
    console.log('******* END CDCH ******');
    var tarificacion_cdch = {
      codEstado: '1',
      glsEstado: 'NOK',
      servicio:{
        codServicio: '',
        glsServicio: '',
        pesoCalculo: weight+'',
        valorServicio: ''
      }
    }
  }

  var tarificacion = {
    _id: '0',
    descripcion: 'Exito',
    tarificacionCXP: {
      tarificacion_cxp
    },
    tarificacionCDCH: {
      tarificacion_cdch
    }
  }

  console.log('--- TARIFICACION ---');
  console.log(tarificacion);
  console.log('--- END TARIFICACION ---');

  var quote = new Quote ({
    description: tarificacion.descripcion,
    email: user.email,
    numQuote: user.quotes,
    cxpCodEstado: tarificacion.tarificacionCXP.tarificacion_cxp.codEstado,
    cxpGlsEstado: tarificacion.tarificacionCXP.tarificacion_cxp.glsServicio,
    cxpCodServicio: tarificacion.tarificacionCXP.tarificacion_cxp.servicio.codServicio,
    cxpGlsServicio: tarificacion.tarificacionCXP.tarificacion_cxp.servicio.glsServicio,
    cxpPesoCalculo: tarificacion.tarificacionCXP.tarificacion_cxp.servicio.pesoCalculo,
    cxpValorServicio: tarificacion.tarificacionCXP.tarificacion_cxp.servicio.valorServicio,
    cdchCodEstado: tarificacion.tarificacionCDCH.tarificacion_cdch.codEstado,
    cdchGlsEstado: tarificacion.tarificacionCDCH.tarificacion_cdch.glsEstado,
    cdchCodServicio: tarificacion.tarificacionCDCH.tarificacion_cdch.servicio.codServicio,
    cdchGlsServicio: tarificacion.tarificacionCDCH.tarificacion_cdch.servicio.glsServicio,
    cdchPesoCalculo: tarificacion.tarificacionCDCH.tarificacion_cdch.servicio.pesoCalculo,
    cdchValorServicio: tarificacion.tarificacionCDCH.tarificacion_cdch.servicio.valorServicio
  });

  console.log(quote);
  quote.save(function (err, res) {
    if (!err) {
      tarificacion._id = res._id;
      console.log('INFO: Cotización registrada (' + user.quotes + ') para el usuario <' + user.email + '>');
      response.send(tarificacion);
    } else {
      console.log('ERROR: registrando cotizacion de usuario: ' + err);
      response.send(err);
    }
  });
}

function getRates (req, res) {
  
    var email = req.param('email');
    var token = req.headers.authorization;
    // verifies secret and checks exp
    jwt.verify(token, config.jwt.secret, function(err, decoded) {
      if (err) {
        res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
        console.log('INFO: Fallo en la autenticación de Token: ' + err);
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        if (email) {
          User.findOne({email:email}, function (err, user) {
            if (!err) {
              if (user) {
                  Quote.find({email:email}, function (err, rates) {
                    if (rates.length > 0) {
                      res.send(rates);
                    } else {
                      res.status(202).send({ code: 202, desc: "User has no quotations"});
                      console.log("LOG: User has no quotations" + err);
                    }
                  });
              } else {
                res.status(404).send({ code: 404, desc: "User doesn't exist"});
                console.log("LOG: User doesn't exist");
              }
            } else {
              res.status(500).send({ code: 500, desc: err});
              console.log('ERROR: ' + err);
            }
          });
        } else {
          res.status(400).send({ code: 400, desc: 'User email is required'});
          console.log('LOG: User email is required');
        }
      }
    });
}