var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactForm = new Schema({
    email: String,
	name: String,	
	phone: String,
	country: String,
	city: String,
	message: String
});

module.exports = mongoose.model('contactForm', contactForm);