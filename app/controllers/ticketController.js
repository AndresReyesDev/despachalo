'use strict';

var User = require('../models/user');
var PaymentInformation = require('../models/paymentInformation');
var Bag = require('../models/bag');
var Address = require('../models/address');
var Invoice = require('../models/electronicInvoice');
var Ballot = require('../models/electronicBallot');
var BallotXML = require('../models/electronicBallotXML');
var TicketService = require('../util/ticketServices');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');
var js2xmlparser = require("js2xmlparser");
var parseString = require('xml2js').parseString;

module.exports = {
	//processDteInvoice: processDteInvoice,
	processDteBallot: processDteBallot,
	processDteBallotMethod: processDteBallotMethod,
	getDteBallot: getDteBallot,
	getDteBallotPDF: getDteBallotPDF
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
															tipoDte: config.ticket.tipoDteFactura,
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
    if (email && transactionId) {
    	User.findOne({email:email}, function (err, user) {
			if (!err) {
				if (user) {
					PaymentInformation.findOne({email:email, generatedId: transactionId}, function (err, pInformation) {
						if (!err && pInformation) {
							
							// Validar que no exista ya una boleta generada para esta transacción

							var today = new Date;
							var dd = today.getDate();
							var mm = today.getMonth()+1; //January is 0!
							var yyyy = today.getFullYear();
							if(dd<10) dd='0'+dd;											    
							if(mm<10) mm='0'+mm;
							var date = yyyy+'-'+mm+'-'+dd;

							var tipoDte = config.ticket.tipoDteBoleta;

							// Process DTE Ticket - Boleta
							var xmlDTE = "<DTE version=\"1.0\">"+
										  "<Documento ID=\"F123T39\">"+
											"<Encabezado>"+
												"<IdDoc>"+
													"<TipoDTE>"+tipoDte+"</TipoDTE>"+
													"<Folio>"+'1'+"</Folio>"+ // Id transacción de pago (Puntopagos)
													"<FchEmis>"+date+"</FchEmis>"+
													"<IndServicio>"+config.ticket.indServicio+"</IndServicio>"+
												"</IdDoc>"+
												"<Emisor>"+
													"<RUTEmisor>"+user.rut+"</RUTEmisor>"+
												"</Emisor>"+
												"<Receptor>"+
													"<RUTRecep>"+user.rut+"</RUTRecep>"+
													"<RznSocRecep>"+user.name +" "+ user.lastname+"</RznSocRecep>"+
												"</Receptor>"+
												"<Totales>"+
													"<MntTotal>"+pInformation.monto+"</MntTotal>"+ // Precio de Token
												"</Totales>"+
											"</Encabezado>"+
											"<Detalle>"+
												"<NroLinDet>"+'1'+"</NroLinDet>"+
												"<NmbItem>"+pInformation.bagTokenName+"</NmbItem>"+ // Nombre de bolsa
												"<QtyItem>"+'1'+"</QtyItem>"+
												"<PrcItem>"+pInformation.monto+"</PrcItem>"+ // Precio de Token
												"<MontoItem>"+pInformation.monto+"</MontoItem>"+ // Precio de Token
											"</Detalle>"+
										"</Documento>"+
									  "</DTE>";

							var xmlAdicionales = "<Adicionales>"+
								                    "<Adicional>"+
								                    "<CodigoBarra1D>"+"</CodigoBarra1D>"+
								                    "<GraficoBarras>"+"</GraficoBarras>"+
								                  "</Adicional>"+
								                "</Adicionales>";

							var ballot = new Ballot ({
								email: email,
								transactionId: transactionId,
								encabezado: {
									idDoc: {
										tipoDte: tipoDte,
										folio: '1', // Id transacción de pago (Puntopagos)
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
										mntTotal: pInformation.monto // Precio de Token
									}
								},
								detalle: {
									nroLinDet: '1',
									nmbItem: pInformation.bagTokenName, // Nombre de bolsa
									qtyItem: '1',
									prcItem: pInformation.monto, // Precio de Token
									montoItem: pInformation.monto // Precio de Token
								},
								xml: xmlDTE,
								xmlAdicionales: xmlAdicionales
							});
							
							ballot.save(function (err, ball) {
								if (!err) {
									// SOAP - Servicio boleta electronica
									TicketService.processDteBoleta(xmlDTE, xmlAdicionales, function (err, result){
										if (!err) {
											var json = JSON.parse(result.return.$value);
											var XMLString = json.IntegracionResult;

											parseString(XMLString, function (err, json) {

												if(!err) {

													var ballotXML = new BallotXML({
														email: email,
														transactionId: transactionId,
														idResultado: json.RespuestaIntegracion.IdResultado[0],
														descripcion: json.RespuestaIntegracion.Descripcion[0],
														detalle: json.RespuestaIntegracion.Detalle[0],
														idProceso: json.RespuestaIntegracion.IdProceso[0],
														nameServer: json.RespuestaIntegracion.NameServer[0],
														nameWS: json.RespuestaIntegracion.NameWS[0],
														iDServer: json.RespuestaIntegracion.IDServer[0],
														folioAsignado: json.RespuestaIntegracion.FolioAsignado[0],
														foliosDisponibles: json.RespuestaIntegracion.FoliosDisponibles[0],
														cantidadResultados: json.RespuestaIntegracion.CantidadResultados[0],
														trackID: json.RespuestaIntegracion.TrackID[0],
														sobreID: json.RespuestaIntegracion.SobreID[0],
														segundosDeEjecucion: json.RespuestaIntegracion.SegundosDeEjecucion[0],
														UrlXMLEnvioSII: json.RespuestaIntegracion.XmlDetalleConsultas[0].IdDoc[0].UrlsXMLEnvioSII[0].UrlXMLEnvioSII[0],
														UrlBMP: json.RespuestaIntegracion.XmlDetalleConsultas[0].IdDoc[0].UrlsBMP[0].UrlBMP[0],
														UrlPDF: json.RespuestaIntegracion.XmlDetalleConsultas[0].IdDoc[0].UrlsPDF[0].UrlPDF[0]
													});

													ballotXML.save(function (err, ballXML){
														if (!err) {
															res.send(ballXML);
														} else {
															res.status(500).send({ code: 500, desc: err});
															console.log('ERROR: Save Ballot xml '+ err);
														}
													});
												} else {
													res.status(500).send({ code: 500, desc: err});
													console.log('ERROR: parseString Ballot xml '+ err);
												}
					                        });
										} else {
											res.status(500).send({ code: 501, desc: 'Error processDteBoleta' + err});
											console.log('ERROR processDteBoleta: ' + err);
										}
									});
								} else {
									res.status(500).send({ code: 502, desc: err});
									console.log('ERROR: ' + err);
								}
							});
		                } else {
		                  res.status(404).send({ code: 404, desc: 'PaymentInformation not found'});
		                  console.log('LOG: PaymentInformation not found');
		                }
		            });
				} else {
					res.status(404).send({ code: 404, desc: "User doesn't exist"});
					console.log("LOG: User doesn't exist");
				}
			} else {
				res.status(500).send({ code: 504, desc: err});
				console.log('ERROR: ' + err);
			}
		});
	} else {
		res.status(400).send({ code: 400, desc: 'User email and transactionId are required'});
		console.log('LOG: User email and transactionId are required');
	}
}

function getDteBallot (req, res) {

	var transactionId = req.param('transactionId');
	var token = req.headers.authorization;
    // verifies secret and checks exp
    jwt.verify(token, config.jwt.secret, function (err, decoded) {
        if (err) {
          res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
          console.log('INFO: Fallo en la autenticación de Token: ' + err);
        } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            getDteBallotMethod(transactionId, res);
        }
    });
}

function getDteBallotMethod(transactionId, res, callback) {
	if (transactionId) {
		BallotXML.findOne({transactionId: transactionId}, function (err, ballotXML) {
			if (ballotXML) {
				if (!callback) {
					res.send(ballotXML);
				} else {
					callback(ballotXML)
				}
			} else {
				res.status(404).send({ code: 404, desc: "Ballot not found"});
				console.log("LOG: Ballot not found");
			}
		});
	} else {
		res.status(400).send({ code: 404, desc: "TransactionId are required"});
		console.log("LOG: TransactionId are required");
	}
}

function getDteBallotPDF (req, res) {

	var transactionId = req.param('transactionId');
	var token = req.headers.authorization;
    // verifies secret and checks exp
    jwt.verify(token, config.jwt.secret, function (err, decoded) {
        if (err) {
          res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
          console.log('INFO: Fallo en la autenticación de Token: ' + err);
        } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;

            getDteBallotMethod(transactionId, null, function (ballotXML) {
            	// SOAP - Servicio Obtener PDF boleta electronica
				TicketService.getDteBoletaPDF(ballotXML.folioAsignado, function (err, result){
					if (!err) {
						var json = JSON.parse(result.return.$value);
						var XMLString = json.IntegracionResult;

						parseString(XMLString, function (err, json) {

							var newURLPDF = json.RespuestaIntegracion.XmlDetalleConsultas[0].IdDoc[0].UrlsPDF[0].UrlPDF[0];
							
							if (newURLPDF != ballotXML.UrlPDF) {
								ballotXML.UrlPDF = newURLPDF;
								console.log('LOG: NewURLPDF signed');
								ballotXML.save(function (err, ballXML){
									if (!err) {
										res.send(ballXML);
									} else {
										res.status(500).send({ code: 500, desc: err});
										console.log('ERROR: Save Ballot xml '+ err);
									}
								});
							} else {
								res.send(ballXML);
							}
	                    });
					} else {
						res.status(500).send({ code: 501, desc: 'Error processDteBoleta' + err});
						console.log('ERROR processDteBoleta: ' + err);
					}
				});
            });
        }
    });
}