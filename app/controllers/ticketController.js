'use strict';

var User = require('../models/user');
var Bag = require('../models/bag');
var Address = require('../models/address');
var Invoice = require('../models/electronicInvoice');
var Ballot = require('../models/electronicBallot');
var TicketService = require('../util/ticketServices');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');
var js2xmlparser = require("js2xmlparser");

module.exports = {
	//processDteInvoice: processDteInvoice,
	processDteBallot: processDteBallot,
	processDteBallotMethod: processDteBallotMethod
};

// Empresa - Factura
function processDteInvoice (req, res) {

	var body = req.body;
	var email = body.email;
	var alias = body.alias;
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
							Bag.findOne({email:email}, function (err, bag) {
								if (!err && bag) {
									Address.findOne({email:email, alias:alias}, function (err, address) {
										if (!err) {
											if (address) {
												var date = new Date;
												// Process DTE Ticket - Factura
												var invoice = new Invoice ({
													encabezado: {
														idDoc: {
															tipoDte: '33',
															folio: '', // Numero de comprobante de pago (Puntopagos)
															fchemis: date,
															fchvenc: date
														},
														emisor: {
															rutEmisor: user.rut,
															rznSoc: user.businessName,
															GiroEmis: user.turn,
															telefono: user.phone,
															acteco: '', // No se que es
															dirOrigen: address.alias,
															cmunaOrigen: address.commune,
															ciudadOrigen: address.city
														},
														receptor: {
															rutRecep: user.rut,
															rznSocRecep: user.businessName,
															giroRecep: user.turn,
															dirRecep: address.alias,
															cmnaRecep: address.commune,
															ciudadRecep: address.city
														},
														totales: {
															mntNeto: '',
															mntExe: '',
															tasaIva: '',
															iva: '',
															mntTotal: ''
														}
													},
													detalle: {
														nroLinDet: bag._id, // Id de Bolsa
														cdgItem: {
															tpoCodigo: '',
															vlrCodigo: ''
														},
														nmbItem: bag.type, // Nombre de bolsa
														dscItem: 'Bolsa de cotizaciones',
														qtyItem: '1',
														unmdItem: '',
														prcItem: '',
														montoItem: ''
													}
												});

												invoice.save(function (err, inv) {
													if (!err) {
														res.send(inv);
													} else {
														res.status(500).send({ code: 501, desc: err});
														console.log('ERROR: ' + err);
													}
												});
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
				                  res.status(404).send({ code: 404, desc: 'No bag bought'});
				                  console.log('LOG: No bag bought');
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

// Cliente - Boleta
function processDteBallot (req, res) {

	var body = req.body;
	var email = body.email;
	var transactionId = body.transactionId;
	var token = req.headers.authorization;
    // verifies secret and checks exp
    jwt.verify(token, config.jwt.secret, function (err, decoded) {
        if (err) {
          res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
          console.log('INFO: Fallo en la autenticación de Token: ' + err);
        } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            processDteBallotMethod(email, transactionId, res);
        }
    });
}

function processDteBallotMethod (email, transactionId, res) {
    if (email) {
    	User.findOne({email:email}, function (err, user) {
			if (!err) {
				if (user) {
					Bag.findOne({email:email}, function (err, bag) {
						if (!err && bag) {
							Bag.getToken(bag.type, function (err, token) {
								if (!err && token) {
									
									var today = new Date;
									var dd = today.getDate();
									var mm = today.getMonth()+1; //January is 0!
									var yyyy = today.getFullYear();
									if(dd<10) dd='0'+dd;											    
									if(mm<10) mm='0'+mm;
									var date = dd+'-'+mm+'-'+yyyy;

									var folio = transactionId+'';
									var tipoDte = '39';
									// Process DTE Ticket - Boleta
									var DTE = {
										"@": {
											"version": '1.0'
										},
										"Documento": {
											'@': {
												"ID": 'F'+folio+'T'+tipoDte
											},
											"Encabezado": {
												"idDoc": {
													"tipoDte": tipoDte,
													"folio": folio, // Numero de comprobante de pago (Puntopagos)
													"fchemis": date,
													"indServicio": '3'
												},
												"emisor": {
													"rutEmisor": user.rut
												},
												"receptor": {
													"rutRecep": user.rut,
													"rznSocRecep": user.name + ' ' + user.lastname
												},
												"totales": {
													"mntTotal": token.rate // Precio de Token
												}
											},
											"Detalle": {
												"nroLinDet": '1',
												"nmbItem": bag.type, // Nombre de bolsa
												"qtyItem": '1',
												"prcItem": token.rate, // Precio de Token
												"montoItem": token.rate // Precio de Token
											}
										}
									}
									var xml = js2xmlparser.parse("DTE", DTE).split("\n").join("").trim().replace(/\\/, "");

									var ballot = new Ballot ({
										encabezado: {
											idDoc: {
												tipoDte: tipoDte,
												folio: folio, // Numero de comprobante de pago (Puntopagos)
												fchemis: date,
												indServicio: '3'
											},
											emisor: {
												rutEmisor: user.rut
											},
											receptor: {
												rutRecep: user.rut,
												rznSocRecep: user.name + ' ' + user.lastname
											},
											totales: {
												mntTotal: token.rate // Precio de Token
											}
										},
										detalle: {
											nroLinDet: '1', // Id de Bolsa
											nmbItem: bag.type, // Nombre de bolsa
											qtyItem: '1',
											prcItem: token.rate, // Precio de Token
											montoItem: token.rate // Precio de Token
										},
										xml: xml
									});
									
									ballot.save(function (err, ball) {
										if (!err) {
											res.send(ball);
											// SOAP - Servicio boleta electronica
											//TicketService.processDteBoleta(user.rut, xml, folio);
										} else {
											res.status(500).send({ code: 500, desc: err});
											console.log('ERROR: ' + err);
										}
									});
								} else {
									res.status(500).send({ code: 501, desc: err});
									console.log('ERROR: ' + err);
								}
							});
		                } else {
		                  res.status(404).send({ code: 404, desc: 'No bag bought'});
		                  console.log('LOG: No bag bought');
		                }
		            }).sort('-purchased');
				} else {
					res.status(404).send({ code: 404, desc: "User doesn't exist"});
					console.log("LOG: User doesn't exist");
				}
			} else {
				res.status(500).send({ code: 502, desc: err});
				console.log('ERROR: ' + err);
			}
		});
	} else {
		res.status(400).send({ code: 400, desc: 'User email is required'});
		console.log('LOG: User email is required');
	}
}