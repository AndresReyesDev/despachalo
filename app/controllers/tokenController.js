'use strict';
var Token = require('../models/token');
var User = require('../models/user');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  findToken: findToken,
  addToken: addToken,
  updateToken: updateToken,
  deleteToken: deleteToken
};

function findToken (req, res) {
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
        if (!err) {
          if (user && user.type == '1') {
            Token.find({}, function (err, token) {
              if (!err && token) {
                res.send(token);
              } else {
                res.status(404).send({ code: 404, descripcion: 'Tokens not found'});
                console.log('LOG: Tokens not found ' + err);
              }
            });
          } else {
            res.status(202).send({ code: 202, desc: 'User must be Administrator'});
            console.log('LOG: User must be Administrator');
          }
        } else {
          res.status(500).send({ code: 500, desc: err.message});
          console.log('ERROR: ' + err);
        }
      });
    }
  });
}

function addToken (req, res) {
    var body = req.body;
    var email = body.email;
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
              if (!err) {
                if (user && user.type == '1') {

                  var token = new Token({
                    name: body.name,
                    numQuote: body.numQuote,
                    rate: body.rate
                  });
                  
                  token.save(function (err, response) {
                    if (!err) {
                      res.send(token);
                      console.log('LOG: Token successfully regiter');
                    } else {
                      res.status(500).send({ code: 500, desc: err.message});
                      console.log('ERROR: ' + err);
                    }
                  }); 
                } else {
                  res.status(202).send({ code: 202, desc: 'User must be Administrator'});
                  console.log('LOG: User must be Administrator');
                }
              } else {
                res.status(500).send({ code: 501, desc: err.message});
                console.log('ERROR: ' + err);
              }
          });
        }
    });
}

function updateToken(req, res) {
    var body = req.body;
    var email = body.email;
    var name = body.name;
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
              if (!err) {
                if (user && user.type == '1') {
                  
                  Token.findOne({name:name}, function (err, token) {
                    if (token) {
                        var numQuote = body.numQuote || '';
                        var rate = body.rate || '';
                        if (numQuote != '') token.numQuote = numQuote;
                        if (rate != '') token.rate = rate;
                      
                        token.save(function (err, response) {
                          if (!err) {
                            res.send(token);
                            console.log('LOG: Token successfully updated');
                          } else {
                            res.status(500).send({ code: 500, desc: err.message});
                            console.log('ERROR: ' + err);
                          }
                        });
                    } else {
                      res.status(404).send({ code: 404, desc: "Token doesn't exist"});
                      console.log("Token: User doesn't exist");
                    }
                  });
                } else {
                  res.status(202).send({ code: 202, desc: 'User must be Administrator'});
                  console.log('LOG: User must be Administrator');
                }
              } else {
                res.status(500).send({ code: 501, desc: err.message});
                console.log('ERROR: ' + err);
              }
          });
        }
    });
}

function deleteToken (req, res) {
    var body = req.body;
    var email = body.email;
    var name = body.name;
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
              if (!err) {
                if (user && user.type == '1') {
                  
                  Token.findOne({name:name}, function (err, token) {
                    if (token) {
                        token.remove(function (err, response) {
                          if (!err) {
                            res.status(200).send({ code: 200, descripcion: 'Token successfully deleted'});
                            console.log('LOG: Token successfully deleted');
                          } else {
                            res.status(500).send({ code: 501, desc: err.message});
                            console.log('ERROR: ' + err);
                          }
                        });
                    } else {
                      res.status(404).send({ code: 404, desc: "Token doesn't exist"});
                      console.log("Token: Token doesn't exist");
                    }
                  });
                } else {
                  res.status(202).send({ code: 202, desc: 'User must be Administrator'});
                  console.log('LOG: User must be Administrator');
                }
              } else {
                res.status(500).send({ code: 501, desc: err.message});
                console.log('ERROR: ' + err);
              }
          });
        }
    });
}