var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var electronicBallot = new Schema({
	encabezado: {
		idDoc: {
			tipoDte: String,
			folio: String,
			fchemis: String,
			indServicio: String
		},
		emisor: {
			rutEmisor: String,
		},
		receptor: {
			rutRecep: String,
			rznSocRecep: String,
		},
		totales: {
			mntTotal: String
		}
	},
	detalle: {
		nroLinDet: String,
		nmbItem: String,
		qtyItem: String,
		prcItem: String,
		montoItem: String
	},
	xml: String
});

module.exports = mongoose.model('ElectronicBallot', electronicBallot);