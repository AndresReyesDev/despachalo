var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../util/config.js');

var token = new Schema({
	name: String,
	numQuote: String,
	rate: String
});

module.exports = mongoose.model('Token', token);