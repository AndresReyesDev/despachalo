'use strict';
var request = require('request');

module.exports = {
  req: req
};

function req (url, callback) {
	request(url, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        callback(body, response.statusCode);
	    } else {
	    	callback('Error::' + error, response.statusCode);
	    }
	});
}