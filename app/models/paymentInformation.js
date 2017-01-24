var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paymentInformation = new Schema({
    generatedId: String,
	token: String,	
	redirect: String,
	email: String,
	monto: String,
	bagTokenName: String,
	bagTokenQuote: String
});

module.exports = mongoose.model('PaymentInformation', paymentInformation);