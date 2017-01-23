var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paymentInformation = new Schema({
    generatedId: String,
	token: String,
	monto: String,
	redirect: String
});

module.exports = mongoose.model('PaymentInformation', paymentInformation);