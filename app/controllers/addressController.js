'use strict';
var User = require('../models/user');
var Address = require('../models/address');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  findAllAddresses: findAllAddresses,
  findAddress: findAddress,
  addAddress: addAddress,
  updateAddress: updateAddress,
  deleteAddress: deleteAddress
};

function findAllAddresses (req, res) {
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
					Address.find({email:email}, function (err, addresses) {
						if (!err) {
							if (addresses) {
								res.send(addresses);
							} else {
								res.status(404).send({ code: 404, desc: "Addresses doesn't exist"});
								console.log("ERROR: Addresses doesn't exist");
							}
						} else {
							res.status(500).send({ code: 500, desc: 'Find addresses error'});
							console.log('ERROR: Find addresses error');
						}
					});
				} else {
					res.status(400).send({ code: 400, desc: 'Email is required'});
					console.log('ERROR: Email is required');
				}
	  	}
	});
}

function findAddress (req, res) {
	var email = req.param('email');
	var alias = req.param('alias');
	var token = req.headers.authorization;
  // verifies secret and checks exp
  jwt.verify(token, config.jwt.secret, function(err, decoded) {
	    if (err) {
	      res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
	      console.log('INFO: Fallo en la autenticación de Token: ' + err);
	    } else {
	      // if everything is good, save to request for use in other routes
	      req.decoded = decoded;
				if (email && alias) {
					Address.findOne({email:email, alias:alias}, function (err, dir) {
						if (!err) {
							if (dir) {
								res.send(dir);
							} else {
								res.status(404).send({ code: 404, desc: "Address doesn't exist"});
								console.log("ERROR: Address doesn't exist");
							}
						} else {
							res.status(500).send({ code: 500, desc: 'Find address error'});
							console.log('ERROR: Find addresses error');
						}
					});
				} else {
					res.status(400).send({ code: 400, desc: 'Email and alias is required'});
					console.log('ERROR: Email and alias is required');
				}
	    }
	});
}

function addAddress (req, res) {
	var body = req.body;
  	var email = body.email;
  	var alias = body.alias;
  	var nameCalle = body.nameCalle;
  	var number = body.number;
  	var department = body.department;
  	var city = body.city;
  	var commune = body.commune;
  	var country = body.country;
  	var postalCode = body.postalCode || '';
  	var nameContact = body.nameContact;
  	var emailContact = body.emailContact;
  	var phoneContact = body.phoneContact;
  	var observations = body.observations || '';
  	var checkDelivery = body.checkDelivery || '';
  	var checkRetirement = body.checkRetirement || '';

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
						if (user.status) {
							
							Address.findOne({email:email, alias:alias}, function (err, dir) {
								if (!err) {
									if (!dir) {
										var address = new Address ({
											email: email,
											alias: alias,
											nameCalle: nameCalle,
										  	number: number,
										  	department: department,
										  	city: city,
										  	commune: commune,
										  	country: country,
										  	postalCode: postalCode,
										  	nameContact: nameContact,
										  	emailContact: emailContact,
										  	phoneContact: phoneContact,
										  	observations: observations,
										  	checkDelivery: checkDelivery,
										  	checkRetirement: checkRetirement
										});
										
										address.save(function (err, response) {
											if (!err) {
												res.send(response);
												console.log('Address successfully created');
											} else {
												res.status(500).send({ code: 500, desc: err.message});
												console.log('ERROR: ' + err);
											}
										});
									} else {
										res.status(400).send({ code: 400, descripcion: 'Address alias is already exist'});
										console.log('ERROR: ' + err);
									}
								} else {
									res.status(500).send({ code: 501, desc: err.message});
									console.log('ERROR: ' + err);
								}
							});	
						} else {
							res.status(400).send({ code: 400, descripcion: "User doesn't exist or is down"});
							console.log('LOG: Usuario no existe o esta inactivo');
						}
					} else {
						res.status(500).send({ code: 502, desc: err.message});
						console.log('ERROR: ' + err);
					}
				});
	    }
	  });
}

function updateAddress (req, res) {
  	var body = req.body;
  	var email = body.email;
  	var alias = body.alias;
  	var nameCalle = body.nameCalle || '';
  	var number = body.number || '';
  	var department = body.department || '';
  	var city = body.city || '';
  	var commune = body.commune || '';
  	var country = body.country || '';
  	var postalCode = body.postalCode || '';
  	var nameContact = body.nameContact || '';
  	var emailContact = body.emailContact || '';
  	var phoneContact = body.phoneContact || '';
  	var observations = body.observations || '';
  	var checkDelivery = body.checkDelivery || '';
  	var checkRetirement = body.checkRetirement || '';

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
							if (user.status) {
								
								Address.findOne({email:email, alias:alias}, function (err, dir) {
									if (!err) {
										if (dir) {
																					
											if (nameCalle != '') dir.nameCalle = nameCalle;
										  	if (number != '') dir.number = number;
										  	if (department != '') dir.department = department;
										  	if (city != '') dir.city = city;
										  	if (commune != '') dir.commune = commune;
										  	if (country != '') dir.country = country;
										  	if (postalCode != '') dir.postalCode = postalCode;
										  	if (nombreContact != '') dir.nombreContact = nombreContact;
										  	if (emailContact != '') dir.emailContact = emailContact;
										  	if (phoneContact != '') dir.phoneContact = phoneContact;
										  	if (observations != '') dir.observations = observations;
										  	if (checkDelivery != '') dir.checkDelivery = checkDelivery;
										  	if (checkRetirement != '') dir.checkRetirement = checkRetirement;
											
											dir.save(function (err, response) {
												if (!err) {
													res.send(response);
													console.log('Address successfully updated');
												} else {
													res.status(500).send({ code: 500, desc: err.message});
													console.log('ERROR: ' + err);
												}
											});
										} else {
											res.status(404).send({ code: 404, descripcion: 'Address not found'});
											console.log('ERROR: ' + err);
										}
									} else {
										res.status(500).send({ code: 501, desc: err.message});
										console.log('ERROR: ' + err);
									}
								});	
							} else {
								res.status(400).send({ code: 400, descripcion: "User doesn't exist or is down"});
								console.log('LOG: Usuario no existe o esta inactivo');
							}
						} else {
							res.status(500).send({ code: 502, desc: err.message});
							console.log('ERROR: ' + err);
						}
					});
		    }
		});
}

function deleteAddress (req, res) {
	var body = req.body;
    var email = body.email;
    var alias = body.alias;

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
				          Address.findOne({email:email, alias:alias}, function (err, dir) {
				            if (dir) {
				                dir.remove(function (err, response) {
				                  if (!err) {
				                    res.send({ code: 200, desc: 'Company deleted'});
				                    console.log('LOG: Company successfully deleted');
				                  } else {
				                    if(err) res.status(500).send({ code: 500, desc: err.message});
				                    console.log('ERROR: ' + err);
				                  }
				                });
				            } else {
				              res.status(404).send({ code: 404, descripcion: 'Address not found'});
				              console.log('ERROR: ' + err);
				            }
				          });
				        } else {
				          res.status(404).send({ code: 404, descripcion: 'User not found'});
				          console.log('LOG: User not found');
				        }
				      } else {
				        res.status(500).send({ code: 501, desc: err.message});
				        console.log('ERROR: ' + err);
				      }
				  });
		    }
		});
}