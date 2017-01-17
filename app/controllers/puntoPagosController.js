'use strict';
var puntoPagos = require('puntopagos-node');

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

function pay(req, res) {
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
	var head = {
		fecha: req.headers.fecha,
		autorizacion: req.headers.autorizacion
	}
	res.send(data);
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