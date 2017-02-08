var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var electronicBallotXML = new Schema({
	email: String,
	transactionId: String,
	idResultado: String,
	descripcion: String,
	detalle: String,
	idProceso: String,
	nameServer: String,
	nameWS: String,
	iDServer: String,
	folioAsignado: String,
	foliosDisponibles: String,
	cantidadResultados: String,
	trackID: String,
	sobreID: String,
	segundosDeEjecucion: String,
	UrlXMLEnvioSII: String,
	UrlBMP: String,
	UrlPDF: String
});

module.exports = mongoose.model('ElectronicBallotXML', electronicBallotXML);