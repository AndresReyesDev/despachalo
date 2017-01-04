'use strict';
var Region = require('../models/region');
var Georeference = require('../util/georeference');
var geoDSPL = require('../util/data/geoDSPL');
var search = require('../util/search');
var Iconv  = require('iconv').Iconv;
var parseString = require('xml2js').parseString;
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  geoRegions: geoRegions
};

var regDSPL = new Array();
regDSPL = geoDSPL.setRegions(regDSPL);


function geoRegions (req, res) {
	
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
		  	Region.count({}, function(err, count){
			    if (count == 0) {
			    	regionsCDCH(res, operation, function (regCDCH) {
				  		regionsCXP(res, operation, function (regCXP) {
				  			modular(regDSPL, regCDCH, regCXP, res);
					  	});
				  	});
			    } else {
			    	res.send({ code: 200, desc: "Regions does exist"});
			    }
			});
		  } else if (operation == "servicio") {
		  	if (curier) {
		  		switch(curier) {
				    case 'cdch':
				        regionsCDCH(res, operation, null);
				        break;
				    case 'cxp':
				        regionsCXP(res, operation, null);
				        break;
				    default:
				    	res.status(404).send({ code: 404, desc: "Curier not found"});
				    	break;
				}
		  	} else {
		  		res.status(400).send({ code: 400, desc: 'Curier is required for this operation'});
		  	}
		  } else if (operation == "listar") {
		  	Region.find(function (err, allRegions){
				if (!err && allRegions.length != 0) {
					res.send(allRegions);
				} else {
					res.status(404).send({ code: 404, desc: "Communes doesn't exist"});
					console.log('ERROR: ' + err);
				}
			}).sort('-_id');
		  }
	    }
	});
}

function regionsCXP (res, op, callback){
	Georeference.regionsCXP( function (chunck) {
		parseString(chunck, function (err, result) {
		    var response = result;
		    var regCXP = response.region;

			switch(op) {
		  		case 'insertar':
		  			mappingRegionsCXP(regDSPL, regCXP, function (respon) {
		  				callback(respon);
		  			});
			        break;
		  		case 'servicio':
		  			res.send(regCXP);
		  			break;
		  	}
		});
	});
}

function regionsCDCH (res, op, callback){
	Georeference.regionsCDCH( function (chunck) {
		var regCDCH = chunck.listarTodasLasRegionesResult;

		for (var i = regCDCH.RegionTO.length - 1; i >= 0; i--) {
	  		var iconv = new Iconv('UTF-8', 'CP1252');			
			regCDCH.RegionTO[i].Nombre = iconv.convert(regCDCH.RegionTO[i].Nombre).toString();
	  	}
	  	switch(op) {
	  		case 'insertar':
	  			mappingRegionsCDCH(regDSPL, regCDCH, function (respon) {
	  				callback(respon);
	  			});
		        break;
	  		case 'servicio':
	  			res.send(regCDCH);
	  			break;
	  	}
	});
}

function modular (regDSPL, regCDCH, regCXP, res){
	var regions = new Array();
	for (var i = regDSPL.length - 1; i >= 0; i--) {
  		var region = new Region ({
  			// DSPL
  			idDSPL: regDSPL[i].idDSPL,
			nameDSPL: regDSPL[i].nameDSPL,
			idOrdinalDSPL: regDSPL[i].idOrdinalDSPL,
			// CDCH
			idCDCH: regCDCH[i].idCDCH,
			nameCDCH: regCDCH[i].nameCDCH,
			// CXP
			idCXP: regCXP[i].idCXP,
			nameCXP: regCXP[i].nameCXP
		});
		save(region);
		regions.push(region);
  	}
  	//regions.sort();
  	res.send(regions);
  	//res.status(200).send({ code: 200, descripcion: 'Regions successfully ingresed'});
}

function save (region) {
	region.save(function (err, response) {
		if (!err) {
			console.log('Region successfully ingresed');
		} else {
			console.log('ERROR: ' + err);
		}
	});
}

function mappingRegionsCDCH(regDSPL, regCDCH, callback) {
	for (var i = regCDCH.RegionTO.length - 3; i >= 0; i--) {
		regDSPL[i].nameCDCH = regCDCH.RegionTO[i].Nombre;
		regDSPL[i].idCDCH = regCDCH.RegionTO[i].Identificador;
	}
	regDSPL[13].nameCDCH = regCDCH.RegionTO[14].Nombre;
	regDSPL[13].idCDCH = regCDCH.RegionTO[14].Identificador;
	regDSPL[14].nameCDCH = regCDCH.RegionTO[13].Nombre;
	regDSPL[14].idCDCH = regCDCH.RegionTO[13].Identificador;
	callback(regDSPL);
}

function mappingRegionsCXP(regDSPL, regCXP, callback) {
	for (var i=0; i < regCXP.regiones.length; i++) {
		var id = regCXP.regiones[i].idRegion[0].substr(1);
		var index = search.regionsCXP(id, regDSPL);
		if (index || index == 0) {
			regDSPL[index].nameCXP = regCXP.regiones[i].glsRegion[0];
			regDSPL[index].idCXP = regCXP.regiones[i].idRegion[0];
		} else {
			console.log(regCXP.regiones[i].glsRegion[0]);
		}
	}
	callback(regDSPL);
}