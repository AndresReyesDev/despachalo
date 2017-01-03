var nodemailer = require('nodemailer');
var config = require('./config.js');

module.exports = {
  sendMailValidation: sendMailValidation,
  sendMailResetPassword: sendMailResetPassword
};

function sendMailValidation(user, psw) {
	// create reusable transporter object using the default SMTP transport
	var transporter = nodemailer.createTransport('smtps://'+ config.mail.user +':'+ config.mail.pass +'@smtp.gmail.com');

	// setup e-mail data with unicode symbols
	var html = '';
	if (psw) {
		html = 'Hola, bienvenido a Despachalo.com ' + '<br/>' +
	    	  '<b> Valida tu registro en el siguiente enlace </b>' + config.mail.confirmar + user.email + '<br/>' + 
	    	  '<b> Se ha generado una contraseña aleatoria:  </b>' + psw; // html body
	} else {
		html = 'Hola, bienvenido a Despachalo.com ' + '<br/>' +
	    	  '<b> Valida tu registro en el siguiente enlace </b>' + config.mail.confirmar + user.email; // html body
	}
	var mailOptions = {
	    from: '"Despachalo.com " <'+ config.mail.user +'>', // sender address
	    to: user.email + ', ' + config.mail.admin, // list of receivers
	    subject: 'Despachalo - Confirmación de correo', // Subject line
	    html: html
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(err, info) {
	    if (!err) {
	        console.log('LOG: Se envio correo de validacion ' + info.response);
	    } else {
	    	console.log('ERROR: No se pudo enviar correo de validacion ' + err);
	    }
	});
}

function sendMailResetPassword(user, psw) {
	// create reusable transporter object using the default SMTP transport
	var transporter = nodemailer.createTransport('smtps://'+ config.mail.user +':'+ config.mail.pass +'@smtp.gmail.com');

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: '"Despachalo.com " <'+ config.mail.user +'>', // sender address
	    to: user.email + ', ' + config.mail.admin, // list of receivers
	    subject: 'Despachalo - Nueva contraseña', // Subject line
	    html: 'Hola, ' + user.nombre + '<br/>' +
	    	  '<b> Su contraseña ha cambiado, ahora es:  </b>' + psw // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(err, info) {
	    if (!err) {
	        console.log('LOG: Se envio correo de reset password ' + info.response);
	    } else {
	    	console.log('ERROR: No se pudo enviar correo de reset password ' + err);
	    }
	});
}