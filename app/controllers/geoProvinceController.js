'use strict';
var Province = require('../models/province');
var geoDSPL = require('../util/data/geoDSPL');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  geoProvinces: geoProvinces
};

var provinces = new Array();
provinces = geoDSPL.setProvinces(provinces);

/**
   * parameters expected in the args:
  * operacion (String)
  **/

function geoProvinces(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var operation = req.param('operation');
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
		  	Province.count({}, function(err, count){
			    if (count == 0) {
			    	var prov = new Array();
			    	for (var i = provinces.length - 1; i >= 0; i--) {
				  		var province = new Province ({
				  			idDSPL: provinces[i].idDSPL,
							nameDSPL: provinces[i].nameDSPL,
							idRegionDSPL: provinces[i].idRegionDSPL
						});
						prov.push(province);
						save(province);
				  	}
				  	res.send(prov);
			    } else {
			    	res.send({ code: 200, desc: "Provinces does exist"});
			    }
			});
		  } else if (operation == "listar") {
		  	Province.find(function (err, allProvinces){
				if (!err && allProvinces.length != 0) {
					res.send(allProvinces);
				} else {
					res.status(404).send({ code: 404, desc: "Provinces doesn't exist"});
					console.log('ERROR: ' + err);
				}
			});
		  }
	    }
	});
}

function save (province) {
	province.save(function (err, response) {
		if (!err) {
			console.log('Provinces successfully ingresed');
		} else {
			console.log('ERROR: ' + err);
		}
	});
}