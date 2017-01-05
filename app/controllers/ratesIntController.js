'use strict';
var Rates = require('../util/rates');
var User = require('../models/user');
var Bag = require('../models/bag');
var QuoteInt = require('../models/quoteInt');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  ratesInt: ratesInt,
  getRatesInt: getRatesInt
};

function ratesInt (req, response) {

  var email = req.param('email');
  var body = req.body;
  // Origin
  var countryOrigin = body.countryOrigin;
  var stateOrigin = body.stateOrigin;
  var cityOrigin = body.cityOrigin;
  var postalCodeOrigin = body.postalCodeOrigin;
  // Destination
  var countryDestination = body.countryDestination;
  var stateDestination = body.stateDestination;
  var cityDestination = body.cityDestination;
  var postalCodeDestination = body.postalCodeDestination;
  // Volumetria
  var weight = body.weight;
  var width = body.width;
  var height = body.height;
  var long = body.long;

  var tarFDX = null;
  var tarDHL = null;

  var token = req.headers.authorization;
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
                        if (tipo == 'dhl') {
                          // Code for DHL
                          console.log('DHL - ' + typeof(chunck));
                          tarDHL = chunck;
                        } else if (tipo == 'fdx') {
                          // Code for FDX
                          console.log('FDX - ' + typeof(chunck));
                          tarFDX = chunck;
                        }

                        // Construir respuesta conjunta
                        if (tarDHL) {
                          services(user, tarFDX, tarDHL, weight, response);
                        }
                      }

                      var addressFrom = {
                        "pais": countryOrigin,
                        "estado": stateOrigin,
                        "ciudad": cityOrigin,
                        "codigoPostal": postalCodeOrigin
                      }
                      var addressTo = {
                        "pais": countryDestination,
                        "estado": stateDestination,
                        "ciudad": cityDestination,
                        "codigoPostal": postalCodeDestination
                      }
                      var parcel = {
                        "peso": weight,
                        "ancho": width,
                        "alto": height,
                        "largo": long
                      }

                      // Tarificacion FEDEX
                      //Rates.tarificarFDX(addressFrom, addressTo, parcel, callback);
                      // Tarificacion DHL
                      Rates.shippo(addressFrom, addressTo, parcel, callback);

                      user.quotes++;
                      user.save(function (err, res) {
                        if (!err) console.log('Numero de cotizaciones de usuario aumentada (' + user.quotes + ' / ' + bag.numQuote + ')');
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

function services (user, tarFDX, tarDHL, pesoPieza, response) {
  
  if (tarDHL.rates_list.length == 0) {
    console.log('ERROR: Ocurrio un error al consumir servicio DHL (' + tarDHL.messages[0] + ') para el usuario <' + user.email + '>');
    response.send(tarDHL.messages[0]);
  } else {
      var tarificacion = {
        _id: '0',
        descripcion: 'Exito',
        tarificacionDHL: {
          codEstado: tarDHL.object_id,
          glsEstado: tarDHL.object_status,
          servicio: {
            codServicio: tarDHL.rates_list[0].object_id,
            glsServicio: tarDHL.rates_list[0].servicelevel_name,
            pesoCalculo: tarDHL.rates_list[0].pesoPieza,
            valorServicio: tarDHL.rates_list[0].amount,
            moneda: tarDHL.rates_list[0].currency
          }
        },
        tarFDX
      }

      var tar = new QuoteInt ({
        description: tarificacion.descripcion,
        email: user.email,
        numQuote: user.quotes,
        dhlCodEstado: tarificacion.tarificacionDHL.codEstado,
        dhlGlsEstado: tarificacion.tarificacionDHL.glsEstado,
        dhlCodServicio: tarificacion.tarificacionDHL.servicio.codServicio,
        dhlGlsServicio: tarificacion.tarificacionDHL.servicio.glsServicio,
        dhlPesoCalculo: tarificacion.tarificacionDHL.servicio.pesoCalculo,
        dhlValorServicio: tarificacion.tarificacionDHL.servicio.valorServicio,
        dhlmoneda: tarificacion.tarificacionDHL.servicio.moneda,
        fdxCodEstado: '',
        fdxGlsEstado: '',
        fdxCodServicio: '',
        fdxGlsServicio: '',
        fdxPesoCalculo: '',
        fdxValorServicio: ''
      });

      tar.save(function (err, res) {
        if (!err) {
          tarificacion._id = res._id;
          console.log('INFO: Cotización Internacional registrada (' + user.quotes + ') para el usuario <' + user.email + '>');
          response.send(tarificacion);
        } else {
          console.log('ERROR: registrando cotizacion Internacional de usuario: ' + err);
          response.send(err);
        }
      });
  }
}

function getRatesInt (req, res) {
  
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
                    QuoteInt.find({email:email}, function (err, rates) {
                      if (rates.length > 0) {
                        res.send(rates);
                      } else {
                        res.status(202).send({ code: 202, desc: "User has no international quotations"});
                        console.log("LOG: User has no international quotations" + err);
                      }
                    });
                } else {
                  res.status(404).send({ code: 404, desc: "User doesn't exist"});
                  console.log("LOG: User doesn't exist");
                }
              } else {
                res.status(500).send({ code: 500, desc: err.message});
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