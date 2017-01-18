var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notification = new Schema({
	head_fecha: String,
    head_autorizacion: String,
    token: String,
    trx_id: String,
	medio_pago: String,
	monto: String,
	fecha_operacion: String,
	numero_tarjeta: String,
	num_cuotas: String,
	tipo_cuotas: String,
	valor_cuota: String,
	primer_vencimiento: String,
	numero_operacion: String,
	codigo_autorizacion: String
});

module.exports = mongoose.model('Notification', notification);