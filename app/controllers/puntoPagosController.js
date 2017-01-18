'use strict';
var puntoPagos = require('puntopagos-node');

var Notification = require('../models/notification');

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
  notificacion: notificacion,
  validar: validar
};

/**
   * parameters expected in the args:
  * monto (String)
  **/

function pagar(req, res) {
	// variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  	var monto = req.param('monto');

	// Config current deployment mode.
	puntoPagos.config('PUNTOPAGOS_KEY', 'PUNTOPAGOS_SECRET');

	// Create payment
	var generatedId = puntoPagos.generateId();
	puntoPagos.pay(generatedId, monto, puntoPagos.paymentMethod.webpay, function callback(err, data){
		if (!err) {
			var paymentInformation = {
				generatedId : generatedId,
				token : data.token,
				redirect : data.redirect
			};
			res.send(paymentInformation);
		} else {
			console.log(err);
			res.send('Error Method Pay :: ' + err);
		}
	});
	// err, data -> {token:token, redirect:redirect}
}

/**
   * parameters expected in the args:
  * generatedId (String)
  **/
  
function notificacion(req, res) {
	// Validate payament

	var data = req.body;
	
	var head_fecha = req.headers.fecha;
	var head_autorizacion = req.headers.autorizacion;

	var token = body.token || '';
	var trx_id = body.trx_id || '';
	var medio_pago = body.medio_pago || '';
	var monto = body.monto || '';
	var fecha_operacion = body.fecha_operacion || '';
	var numero_tarjeta = body.numero_tarjeta || '';
	var num_cuotas = body.num_cuotas || '';
	var tipo_cuotas = body.tipo_cuotas || '';
	var valor_cuota = body.valor_cuota || '';
	var primer_vencimiento = body.primer_vencimiento || '';
	var numero_operacion = body.numero_operacion || '';
	var codigo_autorizacion = body.codigo_autorizacion || '';

	var notification = new Notification ({
		head_fecha: head_fecha,
	    head_autorizacion: head_autorizacion,
	    token: token,
	    trx_id: trx_id,
		medio_pago: medio_pago,
		monto: monto,
		fecha_operacion: fecha_operacion,
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
	      res.send(resp);
	      console.log('LOG: Notification PuntoPagos successfully regiter');
	    } else {
	      res.status(500).send({ code: 500, desc: err});
	      console.log('ERROR: ' + err);
	    }
	});

}

/**
   * parameters expected in the args:
  * generatedId (String)
  **/

function validar(req, res) {
	// Validate payament
	puntoPagos.validate(token, generatedId, monto, function callback(err, data) {
		if (!err) {
			res.send(data);
		} else {
			console.log(err);
			res.send('Error Method Validate :: ' + err);
		}
	});
}