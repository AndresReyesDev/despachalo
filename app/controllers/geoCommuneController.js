'use strict';
var Commune = require('../models/commune');
var Georeference = require('../util/georeference');
var geoDSPL = require('../util/data/geoDSPL');
var search = require('../util/search');
var Iconv  = require('iconv').Iconv;
var parseString = require('xml2js').parseString;
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  geoCommunes: geoCommunes
};

var comDSPL = new Array();
comDSPL = geoDSPL.setCommunes(comDSPL);

function geoCommunes(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var operation = req.param('operation');
  var curier = req.param('curier');
	
	var token = req.headers.authorization;
	// verifies secret and checks exp
	jwt.verify(token, config.jwt.secret, function(err, decoded) {
		if (err) {
		  res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err.message + ')'});
		  console.log('INFO: Fallo en la autenticación de Token: ' + err);
		} else {
		  // if everything is good, save to request for use in other routes
		  req.decoded = decoded;
		  if (operation == "insertar") {
		  	Commune.count({}, function(err, count){
			    if (count == 0) {
			    	communesCDCH(res, operation, function (comCDCH) {
			    		communesCXP(res, operation, function (comCXP) {
				  			modular(comDSPL, comCDCH, comCXP, res);
					  	});
				  	});
			    } else {
			    	res.send({ code: 200, desc: "Communes does exist"});
			    }
			});
		  } else if (operation == "servicio") {
		  	if ( curier ) {
		  		switch(curier) {
				    case 'cdch':
				        communesCDCH(res, operation, null);
				        break;
				    case 'cxp':
				        communesCXP(res, operation, null);
				        break;
				    default:
				    	res.status(404).send({ code: 404, desc: "Curier not found"});
				    	break;
				}
		  	} else {
		  		res.status(400).send({ code: 400, desc: 'Curier is required for this operation'});
		  	}
		  } else if (operation == "listar") {
		  	Commune.find(function (err, allCommunes) {
				if (!err && allCommunes.length != 0) {
					res.send(allCommunes);
				} else {
					res.status(404).send({ code: 404, desc: "Communes doesn't exist"});
					console.log('ERROR: ' + err);
				}
			}).sort('nameDSPL');
		  }
		}
	});
}

function communesCDCH(res, op, callback) {
	Georeference.communesCDCH( function (chunck) {
		var response = chunck;
		var comCDCH = response.listarTodasLasComunasResult;

		for (var i = comCDCH.ComunaTO.length - 1; i >= 0; i--) {
	  		var iconv = new Iconv('UTF-8', 'CP1252');			
			comCDCH.ComunaTO[i].NombreComuna = iconv.convert(comCDCH.ComunaTO[i].NombreComuna).toString();
	  	}
	  	switch(op) {
	  		case 'insertar':
	  			mappingCommunesCDCH(comDSPL, comCDCH, function (respon) {
	  				callback(respon);
	  			});
		        break;
	  		case 'servicio':
	  			res.send(comCDCH);
	  			break;
	  	}
	});
}

function communesCXP(res, op, callback) {
	Georeference.communesCXP( function (chunck) {
		parseString(chunck, function (err, result) {
			if (!err) {
				var response = result;
			    var comCXP = response.cobertura;
			    switch(op) {
			  		case 'insertar':
			  			mappingCommunesCXP(comDSPL, comCXP, function (respon) {
			  				callback(respon);
			  			});
				        break;
			  		case 'servicio':
			  			res.send(comCXP);
			  			break;
			  	}
			} else {
				console.log(err);
			}
		});
	});
}

function modular(comDSPL, comCDCH, comCXP, res) {
	var communes = new Array();
	for (var i = comCXP.length - 1; i >= 0; i--) {
		var commune = new Commune ({
			// DSPL
			idDSPL: comDSPL[i].idDSPL,
			nameDSPL: comDSPL[i].nameDSPL,
			idProvinceDSPL: comDSPL[i].idProvinceDSPL,
			// CDCH
			idCDCH: comCDCH[i].idCDCH,
			nameCDCH: comCDCH[i].nameCDCH,
			idRegionCDCH: comCDCH[i].idRegionCDCH,
			// CXP
			idCXP: comCXP[i].idCXP,
			nameCXP: comCXP[i].nameCXP,
			idRegionCXP: comCXP[i].idRegionCXP
		});
		communes.push(commune);
		save(commune);
	}
	communes.sort();
	//res.send(communes);
	res.status(200).send({ code: 200, descripcion: 'Communes successfully ingresed'});
}

function save(commune) {
	commune.save(function (err, response) {
		if (!err) {
			//console.log('Comuna registrada exitosamente');
		} else {
			console.log('ERROR: ' + err);
		}
	});
}

function mappingCommunesCDCH(comDSPL, comCDCH, callback) {

	for (var i=0; i < comDSPL.length; i++) {
		comDSPL[i].nameDSPL = comDSPL[i].nameDSPL.toUpperCase();
	}
	for (var i=0; i < comCDCH.ComunaTO.length; i++) {
		var index = search.communesCDCH(comCDCH.ComunaTO[i].NombreComuna, comDSPL);
		if (index || index == 0) {
			comDSPL[index].nameCDCH = comCDCH.ComunaTO[i].NombreComuna;
			comDSPL[index].idCDCH = comCDCH.ComunaTO[i].Iata;
			comDSPL[index].idRegionCDCH = comCDCH.ComunaTO[i].Region;
		} else {
			console.log('No se encontro CDCH - ' + comCDCH.ComunaTO[i].NombreComuna);
		}
	}
	callback(comDSPL);
}

function mappingCommunesCXP(comDSPL, comCXP, callback) {

	for (var i=0; i < 345; i++) {
		comDSPL[i].nameDSPL = comDSPL[i].nameDSPL.toUpperCase();
	}
	for (var i=0; i < comCXP.coberturas.length; i++) {
		var index = search.communesCXP(comCXP.coberturas[i].glsComuna[0], comDSPL);
		if (index || index == 0) {
			comDSPL[index].nameCXP = comCXP.coberturas[i].glsComuna[0];
			comDSPL[index].idCXP = comCXP.coberturas[i].codComuna[0];
			comDSPL[index].idRegionCXP = comCXP.coberturas[i].codRegion[0];
		} else {
			console.log('No se encontro CXP - ' + comCXP.coberturas[i].glsComuna[0]);
		}
	}
	callback(comDSPL);
}