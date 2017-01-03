var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var region = new Schema({
	// Despachalo
	idDSPL: String,
	nameDSPL: String,
	idOrdinalDSPL: String,
	// Chilexpress
	idCXP: String,
	nameCXP: String,
	idOrdinalCXP: String,
	// Correos de Chile
	idCDCH: String,
	nameCDCH: String,
	idOrdinalCDCH: String,
	// FEDEX
	idFDX: String,
	nameFDX: String,
	idOrdinalFDX: String,
	// DHL
	idDHL: String,
	nameDHL: String,
	idOrdinalDHL: String
});

module.exports = mongoose.model('Region', region);