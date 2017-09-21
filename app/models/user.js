var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
	email: String,
	name: String,
	lastname: String,
	phone: String,
	type: String,
	password: String,
	rut: String,
	quotes: { type: String, default: 0 },
	status: { type: Boolean, default: false },
	token: String,
	provider: String,
	google: {
		id: String,
		token: String,
		email: String,
		name: String,
		lastname: String
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String,
		lastname: String
	}
});

module.exports = mongoose.model('User', user);