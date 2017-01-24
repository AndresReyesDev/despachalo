'use strict';
var User = require('../models/user');
var Permission = require('../models/permission');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  findPermission: findPermission,
  addPermission: addPermission,
  updatePermission: updatePermission,
  deletePermission: deletePermission
};

function findPermission (req, res) {
	var typeUser = req.param('typeUser');
  	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
	    if (err) {
	      res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
	      console.log('INFO: Fallo en la autenticación de Token: ' + err);
	    } else {
	      // if everything is good, save to request for use in other routes
	      req.decoded = decoded;
		    if (typeUser) {
				Permission.findOne({typeUser:typeUser}, function (err, permission) {
		  			if (!err) {
						if (permission) {
						    res.send(permission);
						} else {
							res.status(404).send({ code: 404, descripcion: 'No permissions for type (' + typeUser + ')'});
							console.log('LOG: No permissions for type (' + typeUser + ')');
						}
					} else {
						res.status(500).send({ code: 500, desc: err});
                        console.log('ERROR: ' + err);
					}
		  		});
			} else {
				Permission.find({}, function (err, permission) {
		  			if (!err) {
						if (permission.length > 0) {
						    res.send(permission);
						} else {
							res.status(404).send({ code: 404, descripcion: "permissions doesn't exist"});
							console.log("LOG: permissions doesn't exist");
						}
					} else {
						res.status(500).send({ code: 500, desc: err});
                        console.log('ERROR: ' + err);
					}
		  		});
			}
	    }
	});


}

function addPermission (req, res) {
	var body = req.body;
  	var typeUser = body.typeUser;
  	var createUser = body.createUser || '';
	var editUser = body.editUser || '';
	var editPermission = body.editPermission || '';
	var resetPassword = body.resetPassword || '';

  	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
	    if (err) {
	      res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
	      console.log('INFO: Fallo en la autenticación de Token: ' + err);
	    } else {
	      // if everything is good, save to request for use in other routes
	      req.decoded = decoded;
	      Permission.findOne({typeUser:typeUser}, function (err, permission) {
			if (!err) {
				if (!permission) {
					var permission = new Permission ({
						typeUser: typeUser,
						createUser: createUser,
						editUser: editUser,
					  	editPermission: editPermission,
					  	resetPassword: resetPassword
					});
					
					permission.save(function (err, response) {
						if (!err) {
							res.send(response);
							console.log('LOG: Permission successfully regiter');
						} else {
							res.status(500).send({ code: 500, desc: err});
                        	console.log('ERROR: ' + err);
						}
					});

				} else {
					res.status(202).send({ code: 202, desc: 'Permission already exist'});
					console.log('LOG: Permission already exist');
				}
			} else {
				res.status(500).send({ code: 501, desc: err.message});
                console.log('ERROR: ' + err);
			}
		  });
	    }
	});
}

function updatePermission (req, res) {
	var body = req.body;
	var email = body.email;
  	var typeUser = body.typeUser;
  	var createUser = body.createUser || '';
	var editUser = body.editUser || '';
	var editPermission = body.editPermission || '';
	var resetPassword = body.resetPassword || '';

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
					Permission.findOne({typeUser:user.type}, function (err, per) {
						if (per.editPermission) {
							Permission.findOne({typeUser:typeUser}, function (err, permission) {
								if (!err) {
									if (permission) {

										if (createUser != '') permission.createUser = createUser;
										if (editUser != '') permission.editUser = editUser;
										if (editPermission != '') permission.editPermission = editPermission;
										if (resetPassword != '') permission.resetPassword = resetPassword;
										
										permission.save(function (err, response) {
											if (!err) {
												res.send(response);
												console.log('Permission successfully updated');
											} else {
												res.status(500).send({ code: 500, desc: err});
                								console.log('ERROR: ' + err);
											}
										});

									} else {
										res.status(404).send({ code: 404, desc: "Permission doesn't exist"});
										console.log("LOG: Permission doesn't exist");
									}
								} else {
									res.status(500).send({ code: 501, desc: err.message});
                					console.log('ERROR: ' + err);
								}
							});
						} else {
							res.status(202).send({ code: 202, desc: 'User must be Administrator'});
                  			console.log('LOG: User must be Administrator');
						}
					});
				}
			}
		  });
	    }
	});
}

function deletePermission (req, res) {
	var body = req.body;
  	var typeUser = body.typeUser;
	
	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
	    if (err) {
	      res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
	      console.log('INFO: Fallo en la autenticación de Token: ' + err);
	    } else {
	      // if everything is good, save to request for use in other routes
	      req.decoded = decoded;
	        Permission.findOne({typeUser:typeUser}, function (err, permission) {
				if (!err) {
					if (permission) {
		                permission.remove(function (err, response) {
		                  if (!err) {
		                    res.status(200).send({ code: 200, desc: 'Permission successfully deleted'});
		                    console.log('LOG: Permission successfully deleted');
		                  } else {
		                    res.status(500).send({ code: 500, desc: err});
                			console.log('ERROR: ' + err);
		                  }
		                });
		            } else {
		              res.status(404).send({ code: 404, desc: "Permission doesn't exist"});
					console.log("LOG: Permission doesn't exist");
		            }
		        } else {
		          res.status(500).send({ code: 501, desc: err.message});
                  console.log('ERROR: ' + err);
		        }
			});
	    }
	});
}