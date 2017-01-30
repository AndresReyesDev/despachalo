var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var address = new Schema({
	email: String,
	alias: String,
	nameStreet: String,
	number: String,
	department: String,
	city: String,
	commune: String,
	country: String,
	postalCode: String,
	nameContact: String,
	emailContact: String,
	phoneContact: String,
	observations: String,
	checkDelivery: { type: Boolean, default: false },
	checkRetirement: { type: Boolean, default: false }
});

module.exports = mongoose.model('Address', address);