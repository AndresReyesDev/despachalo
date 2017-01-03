var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
	email: String,
	name: String,
	lastname: String,
	type: String,
	password: String,
	rut: String,
	quotes: { type: String, default: 0 },
	status: { type: Boolean, default: false },
	token: String
});

module.exports = mongoose.model('User', user);