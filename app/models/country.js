var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var country = new Schema({
	// Despachalo
	name: String,
	code: String
});

module.exports = mongoose.model('Country', country);