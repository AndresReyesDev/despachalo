var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var quote = new Schema({
	descripction: String,
	email: String,
	numQuote: String,
	cxpCodEstado: String,
	cxpGlsEstado: String,
	cxpCodServicio: String,
	cxpGlsServicio: String,
	cxpPesoCalculo: String,
	cxpValorServicio: String,
	cdchCodEstado: String,
	cdchGlsEstado: String,
	cdchCodServicio: String,
	cdchGlsServicio: String,
	cdchPesoCalculo: String,
	cdchValorServicio: String
});

module.exports = mongoose.model('Quote', quote);