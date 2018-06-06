var nodemailer = require('nodemailer');
var config = require('./config');

module.exports = {
  sendMailValidation: sendMailValidation,
  sendMailResetPassword: sendMailResetPassword,
  sendMailContactForm: sendMailContactForm
};

function sendMailValidation(user, psw) {
	// create reusable transporter object using the default SMTP transport
	var transporter = nodemailer.createTransport('smtps://'+ config.mail.user +':'+ config.mail.pass +'@smtp.gmail.com');
	
	// setup e-mail data with unicode symbols
	var html = '';
	if (psw) {
		html = 'Hola, bienvenido a Despachalo.com ' + '<br/>' +
	    	  '<b> Valida tu registro en el siguiente enlace </b>' + config.mail.confirmprod + user.email + '<br/>' + 
	    	  '<b> Se ha generado una contraseña aleatoria:  </b>' + psw; // html body
	} else {
		html = 'Hola, bienvenido a Despachalo.com ' + '<br/>' +
	    	  '<b> Valida tu registro en el siguiente enlace </b>' + config.mail.confirmprod + user.email; // html body
	}
	var mailOptions = {
	    from: '"Despachalo.com " <'+ config.mail.user +'>', // sender address
	    to: user.email + ', ' + config.mail.admin + ', ' + config.mail.developer, // list of receivers
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
	    html: 'Hola, ' + user.name + '<br/>' +
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

function sendMailContactForm(req, res) {

	var msg = req.message;
	var email = req.email;
	var name = req.name;
	var phone = req.phone;
	var country = req.country;
	var city = req.city;
	// create reusable transporter object using the default SMTP transport
	var transporter = nodemailer.createTransport('smtps://'+ config.mail.user +':'+ config.mail.pass +'@smtp.gmail.com');

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: '"Despachalo.com " <'+ config.mail.user +'>', // sender address
	    to: email + ', ' + config.mail.admin, // list of receivers
	    subject: 'Despachalo - Gracias por contactarnos', // Subject line
	    html: 'Hola, ' + '<b>' + name + '</b>' + '<br/>' +
			  'Hemos recibido su mensaje, muy pronto le contactaremos. ' + '<br/><br/>'+
			  'Su mensaje: ' + '<br/>' +
			  'Teléfono: ' + phone + '<br/>'+
			  'Ubicación: ' + country + ', ' + city + '<br/>' +
			  'Mensaje: ' + msg // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(err, info) {
	    if (!err) {
			console.log('LOG: Se envio correo de Contact form ' + info.response);
			res = info.response;
	    } else {
			console.log('ERROR: No se pudo enviar correo de Contact form ' + err);
			res = err;
	    }
	});
}