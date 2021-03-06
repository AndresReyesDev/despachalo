'use strict';
var User = require('../models/user');
var Bag = require('../models/bag');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  findBag: findBag,
  findBags: findBags,
  addBag: addBag,
  addBagMethod: addBagMethod
};

function findBag (req, res) {
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
        User.findOne({email:email}, function (err, user) {
          if (user) {
              Bag.findOne({email:email}, function (err, bag) {
                if (!err && bag) {
                  var user_bag = {
                    bag: bag,
                    user: user
                  }
                  res.status(200).send({code: 200,desc: "Bag for  " + email,content: {user_bag}});
                } else {
                  res.status(404).send({ code: 404, desc: 'No bag bought'});
                  console.log('LOG: No bag bought');
                }
              }).sort('-purchased');
          } else {
            res.status(404).send({ code: 404, desc: "User doesn't exist"});
            console.log("LOG: User doesn't exist");
          }
        });
      }
  });
}

function findBags (req, res) {
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
        Bag.find({email:email}, function (err, bags) {
          if (!err && bags.length != 0) {
            res.status(200).send({code: 200,desc: "Bags for  " + email,content: {bags}});
          } else {
            res.status(404).send({ code: 404, desc: 'No bags bought'});
            console.log('LOG: No bags bought');
          }
        }).sort('-purchased');
      }
  });
}

function addBag (req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var body = req.body;
  var email = body.email;
  var type = body.type;

  var token = req.headers.authorization;
  // verifies secret and checks exp
  jwt.verify(token, config.jwt.secret, function(err, decoded) {
      if (err) {
        res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
        console.log('INFO: Fallo en la autenticación de Token: ' + err);
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        addBagMethod(email, type, res);
      }
  });
}

function addBagMethod (email, type, res) {
            User.findOne({email:email}, function (err, user) {
              if (!err && user) {
                if (user.status) {
                  Bag.findOne({email:email}, function (err, userBag) {
                    if (!err) {
                      if (userBag) {
                        if (userBag.type == type) {
                          // Acumular numCotizaciones si se compra una nueva bolsa del mismo tipo
                          var remaining = parseInt(userBag.numQuote) - parseInt(user.quotes);
                          saveBag(user, type, remaining, res);
                        } else {
                          // Crear nueva bolsa de otro tipo y resetear cotizaciones de usuario
                          saveBag(user, type, 0, res);
                        }
                      } else {
                        // Crear nueva bolsa de otro tipo y resetear cotizaciones de usuario
                        saveBag(user, type, 0, res);
                      }
                    } else {
                      res.status(500).send({ code: 500, desc: err});
                      console.log('ERROR: ' + err);
                    }
                  }).sort('-purchased');
                } else {
                  res.status(202).send({ code: 202, desc: 'User not validated'});
                  console.log('LOG: User not validated');
                }
              } else {
                res.status(404).send({ code: 404, desc: "User doesn't exist"});
                console.log("LOG: User doesn't exist");
              }
          });
        };

function saveBag (user, type, remaining, res) {
  Bag.getQuotes(type, function (err, numQuote) {
    if (!err && numQuote) {
      var bag = new Bag ({
        email: user.email,
        type: type,
        numQuote: parseInt(numQuote) + parseInt(remaining),
        purchased: new Date
      });

      bag.save(function (err, bag){
        if (!err) {
          res.status(200).send({code: 200,desc: "Bag prepaid successfully created " + user.email,content: {bag}});
          console.log('Bag prepaid successfully created');
        } else {
          res.status(500).send({ code: 501, desc: err.message});
          console.log('ERROR: ' + err);
        }
      });
      resetUserQuotes(user);
    } else {
      res.status(202).send({ code: 202, desc: 'Bag not available'});
      console.log('LOG: Bag not available');
    }
  });
}

function resetUserQuotes(user) {
  user.quotes = 0;
  user.save(function (err, res) {
    if (!err) console.log('User Quotes reset');
      else console.log('ERROR: User Quotes reset: ' + err);
    });
}