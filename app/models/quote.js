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

var quoteInt = new Schema({
	description: String,
	email: String,
	numQuote: String,
	dhlCodEstado: String,
	dhlGlsEstado: String,
	dhlCodServicio: String,
	dhlGlsServicio: String,
	dhlPesoCalculo: String,
	dhlValorServicio: String,
	dhlmoneda: String,
	fdxCodEstado: String,
	fdxGlsEstado: String,
	fdxCodServicio: String,
	fdxGlsServicio: String,
	fdxPesoCalculo: String,
	fdxValorServicio: String
});

module.exports = mongoose.model('Quote', quote);
module.exports = mongoose.model('QuoteInt', quoteInt);