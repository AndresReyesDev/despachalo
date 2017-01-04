'use strict';
var Country = require('../models/country');
var jwt    = require('jsonwebtoken');
var config = require('../util/config');

module.exports = {
  geoCountries: geoCountries
};

function geoCountries (req, res) {

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
		    if (operation == 'listar') {
		  		Country.find({}, function (err, countries){
					if (!err) {
						if (countries.length > 0) {
							res.send(countries);
						} else {
							res.send({ code: 200, desc: "Countries doesn't exist"});
						}
					} else {
						res.status(500).send({ code: 500, desc: "Error find countries"});
					}
				}).sort('name');
		  	} else {

		  		Country.count({}, function (err, count){
    				if (count != 0) {
    					res.send({ code: 200, desc: "Countries does exist"});
    				} else {
    					var countries = require('../util/data/countries');
						var inserts = 0;
						var errors = 0;
						
						for (var i = countries.countries.length - 1; i >= 0; i--) {
							var country = new Country ({
								name: countries.countries[i].Name,
								code: countries.countries[i].Code
							});
							country.save(function (err, response) {
								if (!err) {
									inserts=inserts+1;
									console.log('Countries successfully inserted');
								} else {
									errors=errors+1;
									console.log('ERROR: ' + err);
								}
								if (inserts + errors == countries.countries.length) {
									res.status(200).send({ code: 200, descripcion: '(' + inserts + ') countries with (' + errors + ') errors have been entered'});
								}
							});
						};
    				}
				})
		  	}
	    }
	});
}