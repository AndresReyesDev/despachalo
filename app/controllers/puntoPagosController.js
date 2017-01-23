'use strict';
var puntoPagos = require('puntopagos-node');

var Notification = require('../models/notification');
var PaymentInformation = require('../models/paymentInformation');

/** 
 * Modificar variables de configuración en Modulo PuntoPagos.
 * PUNTOPAGOS_KEY
 * PUNTOPAGOS_SECRET
 * 
 * Configurar hora de servidor a horario Chile.
 * sudo dpkg-reconfigure tzdata
 * sudo ntpdate ntp.shoa.cl
 *
 **/

module.exports = {
  pagar: pagar,
  getNotificacion: getNotificacion,
  postNotificacion: postNotificacion
};

function pagar(req, res) {
	// variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  	var monto = req.param('monto');

	// Config current deployment mode.
	puntoPagos.config('PUNTOPAGOS_KEY', 'PUNTOPAGOS_SECRET');

	// Create payment
	var generatedId = puntoPagos.generateId();
	puntoPagos.pay(generatedId, monto, puntoPagos.paymentMethod.ripley, function callback(err, data){
		if (!err) {
			var paymentInformation = new PaymentInformation ({
				generatedId : generatedId,
				token : data.token,
				monto : monto,
				redirect : data.redirect
			});

			paymentInformation.save(function (err, resp) {
			    if (!err) {
			      res.send(resp);
			      console.log('LOG: Payment Information PuntoPagos successfully regiter');
			    } else {
			      res.status(500).send({ code: 500, desc: err});
			      console.log('ERROR: ' + err);
			    }
			});
		} else {
			console.log(err);
			res.send('Error Method Pay :: ' + err);
		}
	});
}

function getNotificacion(req, res) {
	// Validate payament

	var token = req.param('token');

	PaymentInformation.findOne({token:token}, function (err, pInformation) {
		if (!err && pInformation) {

			// Validate payament
			puntoPagos.validate(token, pInformation.generatedId, pInformation.monto, function callback(err, data) {
				if (!err) {
					saveNotification(data);
					res.send('Compra OK');
				} else {
					console.log(err);
					res.status(401).send({ code: 401, descripcion: 'Fallo en la autenticación de Token (' + err + ')'});
				}
			});
		} else {
			res.status(404).send({ code: 404, desc: "PaymentInformation doesn't exist"});
		}
	});

}

function postNotificacion(req, res) {
	// Validate payament

	var data = req.body;
	
	var head_fecha = req.headers.fecha;
	var head_autorizacion = req.headers.autorizacion;

	data.head_fecha = head_fecha;
	data.head_autorizacion = head_autorizacion;

	saveNotification(data);
}

function saveNotification (data, callback) {

	var head_fecha = data.head_fecha || '';
	var head_autorizacion = data.head_autorizacion || '';

	var respuesta = data.respuesta || '';
	var token = data.token || '';
	var trx_id = data.trx_id || '';
	var medio_pago = data.medio_pago || '';
	var medio_pago_descripcion = data.medio_pago_descripcion || '';
	var monto = data.monto || '';
	var fecha_operacion = data.fecha_operacion || '';
	var fecha_aprobacion = data.fecha_aprobacion || '';
	var numero_tarjeta = data.numero_tarjeta || '';
	var num_cuotas = data.num_cuotas || '';
	var tipo_cuotas = data.tipo_cuotas || '';
	var valor_cuota = data.valor_cuota || '';
	var primer_vencimiento = data.primer_vencimiento || '';
	var numero_operacion = data.numero_operacion || '';
	var codigo_autorizacion = data.codigo_autorizacion || '';

	var notification = new Notification ({
		head_fecha: head_fecha,
	    head_autorizacion: head_autorizacion,
	    respuesta: respuesta,
	    token: token,
	    trx_id: trx_id,
		medio_pago: medio_pago,
		medio_pago_descripcion: medio_pago_descripcion,
		monto: monto,
		fecha_operacion: fecha_operacion,
		fecha_aprobacion: fecha_aprobacion,
		numero_tarjeta: numero_tarjeta,
		num_cuotas: num_cuotas,
		tipo_cuotas: tipo_cuotas,
		valor_cuota: valor_cuota,
		primer_vencimiento: primer_vencimiento,
		numero_operacion: numero_operacion,
		codigo_autorizacion: codigo_autorizacion
	});
	  
	notification.save(function (err, resp) {
	    if (!err) {
	      console.log('LOG: Notification PuntoPagos successfully regiter');
	    } else {
	      console.log('ERROR: ' + err);
	    }
	});
}