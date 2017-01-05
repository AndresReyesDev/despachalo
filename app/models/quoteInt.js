var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

module.exports = mongoose.model('QuoteInt', quoteInt);