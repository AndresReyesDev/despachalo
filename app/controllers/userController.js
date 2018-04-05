'use strict';

var User = require('../models/user');
var Permission = require('../models/permission');
var Bag = require('../models/bag');

var encrypt = require('../util/encrypt');
var generator = require('generate-password');
var jwt    = require('jsonwebtoken');
var Mailer = require('../util/mailer.js');
var config = require('../util/config');

module.exports = {
	userLogin: userLogin,
	findUsers: findUsers,
	findUserByEmail: findUserByEmail,
	findTypesUser: findTypesUser,
	findTypeUser: findTypeUser,
	addUser: addUser,
	userResetPassword: userResetPassword,
	userResetPasswordByAdmin: userResetPasswordByAdmin,
	userRecoverPassword: userRecoverPassword,
	updateUser: updateUser,
	userRegister: userRegister,
	userValidateEmail: userValidateEmail,
	deleteUser: deleteUser
};

function userLogin (req, res) {

	var body = req.body;
	var email = body.email;
	var password = body.password;

	User.findOne({email:email}, function (err, user) {
		if (!err && user) {
			if (user.password != null) {
				encrypt.comparePassword(password, user.password, function (err, isPasswordMatch) {
					if (!err && isPasswordMatch) {
						var tokenUser = {
		                    id: user._id,
		                    email: user.email
		                }
		                var token = jwt.sign(tokenUser, config.jwt.secret, {
		                  expiresIn: '1d'
		                });
						user.token = token;
						if (user.provider=='google') {
		                    user.google.token = token;
		                } else if (user.provider=='facebook') {
		                    user.facebook.token = token;
		                }
						console.log('*** USER LOGIN ***');
						console.log(user);
						user.save(function (err, response) {
							if (!err) {
								res.status(200).send({code: 200,desc: "User logged in successfully " + email,content: {response}});
							} else {
								res.status(500).send({ code: 500, descripcion: 'User not logged'});
								console.log('ERROR: ' + err);
							}
						});
					} else {
						res.status(400).send({ code: 400, descripcion: 'Incorrect password'});
						console.log('INFO: Incorrect password: ' + err);
					}
				});
			} else {
				res.status(202).send({ code: 202, descripcion: "User is visitor, doesn't have an associated password"});
				console.log("INFO: User is visitor, doesn't have an associated password: " + err);
			}
		} else {
			res.status(404).send({ code: 404, descripcion: "Users doesn't exist"});
			console.log("INFO: Users doesn't exist: " + err);
		}
	});
}

function findUsers (req, res) {

	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
		if (err) {
			res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
			console.log('INFO: Fallo en la autenticación de Token: ' + err);
		} else {
	      // if everything is good, save to request for use in other routes
	      req.decoded = decoded;
	      User.find({}, function (err, users) {
	      	if (!err) {
	      		if (users.length > 0) {
	      			res.status(200).send({code: 200,desc: "Users found successfully" ,content: {users}}); 
	      		} else {
	      			res.status(404).send({ code: 404, desc: "Users doesn't exist"});
	      			console.log("LOG: Users doesn't exist");
	      		}
	      	} else {
	      		res.status(500).send({ code: 500, desc: err});
	      		console.log('ERROR: ' + err);
	      	}
	      });
	  }
	});
}

function findUserByEmail (req, res) {
	
	var body = req.body;
	var email = body.email;
	var token = req.headers.authorization;
    // verifies secret and checks exp
    jwt.verify(token, config.jwt.secret, function (err, decoded) {
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
            				res.status(200).send({code: 200,desc: "User found successfully " + email,content: {user}}); 
            			} else {
            				res.status(404).send({ code: 404, desc: "Users doesn't exist"});
	      					console.log("LOG: Users doesn't exist");
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

function findTypesUser (req, res) {

	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
		if (err) {
			res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
			console.log('INFO: Fallo en la autenticación de Token: ' + err);
		} else {
	      // if everything is good, save to request for use in other routes
	      req.decoded = decoded;
	      var types = {
	      	super: config.user.type.super,
	      	admin: config.user.type.admin,
	      	client: config.user.type.client
	      }
	      res.status(200).send({code: 200,desc: "User types found successfully",content: {types}}); 
	  }
	});
}

function findTypeUser (req, res) {

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
	      if (email) {
	      	User.findOne({email:email}, function (err, user) {
	      		if (!err) {
	      			if (user) {
	      				res.status(200).send({code: 200,desc: "User type found successfully " + email,content: {user}}); 
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

// Registar usuario administrador

function addUser (req, res) {
	// variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
	var body = req.body;
	var psw = generator.generate({length: 10,numbers: true});

	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
		if (err) {
			res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
			console.log('INFO: Fallo en la autenticación de Token: ' + err);
		} else {
	      // if everything is good, save to request for use in other routes
	      req.decoded = decoded;
	      encrypt.cryptPassword(psw, function (err, hash) {
	      	if (!err && hash) {
	      		var password = 	hash;
	      		var email = body.email;
	      		User.findOne({email:email}, function (err, user) {
	      			if (!err) {
	      				if (!user) {
	      					var name = body.name;
	      					var lastname = body.lastname;
	      					var rut = body.rut;
	      					var type = body.type;
	      					var phone = body.phone;
	      					var mobile = body.mobile;

	      					var user = new User ({
	      						email: email,
	      						name: name,
	      						lastname: lastname,
	      						password: password,
	      						rut: rut,
	      						type: type,
	      						phone: phone,
	      						mobile: mobile
	      					});
	      					save(user, res);
								// Send mail de validación de correo
								Mailer.sendMailValidation(user, psw);
							} else {
								res.status(404).send({ code: 404, desc: "User does exist"});
								console.log("LOG: User does exist");
							}
						} else {
							res.status(500).send({ code: 500, desc: err});
							console.log('ERROR: ' + err);
						}
					});
	      	} else {
	      		res.status(500).send({ code: 501, descripcion: 'Error encrypt password'});
	      		console.log('ERROR: ' + err);
	      	}
	      });
	  }
	});
}

function save (user, res) {
	user.save(function (err, response) {
		if (!err) {
			res.status(200).send({code: 200,desc: "User saved successfully ",content: {response}}); 
		} else {
			res.status(500).send({ code: 501, desc: err.message});
			console.log('ERROR: ' + err);
		}
	});
}

function userResetPasswordByAdmin (req, res) {
	
	var body = req.body;
	var admin = body.admin;
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
	      User.findOne({email:admin}, function (err, user) {
	      	if (!err && user) {
	      		Permission.findOne({typeUser:user.type}, function (err, per) {
	      			if (per.resetPassword) {
	      				User.findOne({email:email}, function (err, user) {
	      					if (!err) {
	      						if (user) {
	      							var psw = generator.generate({length: 10,numbers: true});
	      							encrypt.cryptPassword(psw, function (err, hash) {
	      								if (!err && hash) {
	      									var password = 	hash;
	      									user.password = password;
	      									save(user, res);
												// Send mail Reset Password
												Mailer.sendMailResetPassword(user, psw);
											} else {
												res.status(500).send({ code: 500, descripcion: 'Error encrypt password'});
												console.log('ERROR: ' + err);
											}
										});
	      						} else {
	      							res.status(404).send({ code: 404, desc: "User does'n exist"});
	      							console.log("LOG: User doesn't exist");
	      						}
	      					} else {
	      						res.status(500).send({ code: 501, desc: err.message});
	      						console.log('ERROR: ' + err);
	      					}
	      				});
	      			} else {
	      				res.status(401).send({ code: 402, desc: "User isn't authorized to perform this action."});
	      				console.log("LOG: User isn't authorized to perform this action.");
	      			}
	      		});
	      	} else {
	      		res.status(404).send({ code: 404, desc: "User admin does exist"});
				console.log("LOG: User admin does exist");
	      	}
	      });
	  }
	});
}

function userRecoverPassword (req, res) {
	var body = req.body;
	var email = body.email;
	User.findOne({email:email}, function (err, user) {
		if (!err) {
			if (user) {
				var psw = generator.generate({length: 10,numbers: true});
				encrypt.cryptPassword(psw, function (err, hash) {
					if (!err && hash) {
						var password = 	hash;
						user.password = password;
						save(user, res);
						// Send mail Reset Password
						Mailer.sendMailResetPassword(user, psw);
					} else {
						res.status(500).send({ code: 500, descripcion: 'Error encrypt password'});
						console.log('ERROR: ' + err);
					}
				});
			} else {
				res.status(404).send({ code: 404, desc: "User does'n exist"});
				console.log("LOG: User doesn't exist");
			}
		} else {
			res.status(500).send({ code: 501, desc: err.message});
			console.log('ERROR: ' + err);
		}
	});
}

function userResetPassword (req, res) {
	
	var body = req.body;
	var email = body.email;
	var oldPassword = body.oldPassword;
	var newPassword = body.newPassword;
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
				if (user) {
					encrypt.comparePassword(oldPassword, user.password, function (err, isPasswordMatch) {
						if (!err && isPasswordMatch) {
							encrypt.cryptPassword(newPassword, function (err, hash) {
							if (!err && hash) {
								var password = 	hash;
								user.password = password;
								save(user, res);
							} else {
								res.status(500).send({ code: 500, descripcion: 'Error encrypt password'});
								console.log('ERROR: ' + err);
							}
						});
						} else {
							res.status(400).send({ code: 400, descripcion: 'Incorrect password'});
							console.log('INFO: Incorrect password: ' + err);
						}
					});
				} else {
					res.status(404).send({ code: 404, desc: "User does'n exist"});
					console.log("LOG: User doesn't exist");
				}
			} else {
				res.status(500).send({ code: 501, desc: err.message});
				console.log('ERROR: ' + err);
			}
		});
	  }
	});
}

function updateUser (req, res) {

	var body = req.body;
	var email = body.email;
	var name = body.name || '';
	var lastname = body.lastname || '';
	var password = body.password || '';
	var rut = body.rut || '';
	var type = body.type || '';
	var phone = body.phone || '';
	var mobile = body.mobile || '';
	console.log('*** UPDATE USER ***');
	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
		if (err) {
			res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
			console.log('INFO: Fallo en la autenticación de Token: ' + err);
		} else {
	      // if everything is good, save to request for use in other routes
	      console.log('Init process updateUser for ' + email);
	      req.decoded = decoded;
	      User.findOne({email:email}, function (err, user) {
	      	if (!err && user) {
	      		if (name != '') user.name = name;
	      		if (lastname != '') user.lastname = lastname;
	      		if (rut != '') user.rut = rut;
	      		if (type != '') user.type = type;
	      		if (phone != '') user.phone = phone;
	      		if (mobile != '') user.mobile = mobile;
	      		if (password != '') {
	      			encrypt.cryptPassword(password, function (err, hash) { 
	      				if (!err && hash) {
	      					user.password = hash;
	      					save(user, res);
	      				}
	      			});
	      		} else {
	      			save(user, res);
	      		}
	      	} else {
	      		res.status(404).send({ code: 404, desc: "User does'n exist"});
	      		console.log("LOG: User doesn't exist");
	      	}
	      });
	  }
	});
}

// Registar usuario clientes
function userRegister (req, res) {

	var body = req.body;
	var email = body.email;

	User.findOne({email:email}, function (err, user) {
		if (!err) {
			if (!user) {
				var token = jwt.sign({email: email}, config.jwt.secret, {
					expiresIn: '1d' // expires in 24 hours
			    });
				var user = new User ({
					email: email,
					name: body.name,
					lastname: body.lastname,
					type: body.type,
					phone: body.phone,
					mobile: body.mobile,
					token: token,
					quotes : config.bag.type.visitor,
					provider: 'despachalo'
				});
				
				user.save(function (err, response) {
					if (!err) {
						console.log('User successfully registered');
						var type = 'Visitante';
						saveBag(response, type, res);
						// Send mail de validación de correo
						Mailer.sendMailValidation(user, null);
					} else {
						res.status(500).send({ code: 500, desc: err});
						console.log('ERROR: ' + err);
					}
				});	
			} else {
				res.status(404).send({ code: 404, desc: "User does exist"});
				console.log("LOG: User does exist");
			}
		} else {
			res.status(500).send({ code: 501, desc: err});
			console.log('ERROR: ' + err);
		}
	});
}

function saveBag (user, type, res) {
	Bag.getQuotes(type, function (err, numQuote) {
		if (!err && numQuote) {
			var bag = new Bag ({
				email: user.email,
				type: type,
				numQuote: numQuote,
				purchased: new Date
			});

			bag.save(function (err, response) {
				if (!err) {
					res.status(200).send({code: 200,desc: "Bag successfully saved for " + user.email,content: {response}}); 
					console.log('LOG: Visitor bag successfully assigned');
				} else {
					res.status(500).send({ code: 502, desc: err});
					console.log('ERROR: ' + err);
				}
			});
		} else {
			res.status(500).send({ code: 503, desc: err});
			console.log('ERROR: ' + err);
		}
	});
}

function userValidateEmail (req, res) {

	var email = req.param('email');

	User.findOne({email:email}, function (err, user) {
		if (!err && user) {
			if (!user.status){
				user.status = true;
				user.save(function (err, response) {
					if (!err) {
						//res.status(200).send({code: 200,desc: "User validated successfully" + email,content: {response}}); 
						res.redirect('/reload' + '?token=' + response.token + '&email=' +  response.email);
						console.log('User validated successfully');
					} else {
						res.redirect('/loginUser' +  err);
						console.log('ERROR: ' + err);
					}
				});
			} else {
				res.redirect('/loginUser' +  err);
				console.log('LOG: User already validated');
			}
		} else {
			res.redirect('/loginUser' +  err);
			console.log("LOG: User doesn't exist");
		}
	});
}

function deleteUser (req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
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
	      	if (!err && user) {
	      		if (user.status){
	      			user.status = false;
	      			user.save(function (err, response) {
	      				if (!err) {
	      					res.status(200).send({code: 200,desc: "User delayed successfully " + email,content: {response}}); 
	      					console.log('User delayed successfully');
	      				} else {
	      					res.status(500).send({ code: 500, desc: err});
	      					console.log('ERROR: ' + err);
	      				}
	      			});
	      		} else {
	      			res.status(202).send({ code: 202, desc: 'User already disabled'});
	      			console.log('LOG: User already disabled');
	      		}
	      	} else {
	      		res.status(404).send({ code: 404, desc: "User doesn't exist"});
	      		console.log("LOG: User doesn't exist");
	      	}
	      });
	  }
	});
}
