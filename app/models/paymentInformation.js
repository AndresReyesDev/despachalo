var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paymentInformation = new Schema({
    generatedId: String,
	token: String,	
	redirect: String,
	email: String,
	monto: String,
	bagTokenName: String,
	bagTokenQuote: String,
	purchased: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentInformation', paymentInformation);