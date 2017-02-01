var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var electronicInvoice = new Schema({
	encabezado: {
		idDoc: {
			tipoDte: String,
			folio: String,
			fchemis: String,
			fchvenc: String
		},
		emisor: {
			rutEmisor: String,
			rznSoc: String,
			GiroEmis: String,
			telefono: String,
			acteco: String,
			dirOrigen: String,
			cmunaOrigen: String,
			ciudadOrigen: String
		},
		receptor: {
			rutRecep: String,
			rznSocRecep: String,
			giroRecep: String,
			dirRecep: String,
			cmnaRecep: String,
			ciudadRecep: String
		},
		totales: {
			mntNeto: String,
			mntExe: String,
			tasaIva: String,
			iva: String,
			mntTotal: String
		}
	},
	detalle: {
		nroLinDet: String,
		cdgItem: {
			tpoCodigo: String,
			vlrCodigo: String
		},
		nmbItem: String,
		dscItem: String,
		qtyItem: String,
		unmdItem: String,
		prcItem: String,
		montoItem: String
	},
	xml: String
});

module.exports = mongoose.model('ElectronicInvoice', electronicInvoice);