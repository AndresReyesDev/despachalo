'use strict';
var soap = require('soap');
var config = require('./config');

module.exports = {
  processDteFactura: processDteFactura,
  processDteBoleta: processDteBoleta
};

// Empresa - Factura
function processDteFactura (rut, xmlBasico, folio, callback) {
	var url_ticket = config.ticket.url;

  var args = { 
    rut: rut,
    clave: '',
    xml2: xmlBasico,
    ambiente: '0',
    asignafolio: folio,
    adicionales: ''
  };

  soap.createClient(url_cdc, function(err, client) {
    client.procesadte(args, function(err, result) {
      if (!err) {
        callback(result);
      } else {
        console.log(err);
        callback('Error::' + err.message);
      }
    });
  });
}

// Cliente - Boleta
function processDteBoleta (rut, xmlBasico, folio, callback) {
  var url_ticket = config.ticket.url;

  var args = { 
    rut: rut,
    clave: '',
    xml2: xmlBasico,
    ambiente: '0',
    asignafolio: folio,
    adicionales: ''
  };

  soap.createClient(url_cdc, function(err, client) {
    client.procesadteBoleta(args, function(err, result) {
      if (!err) {
        callback(result);
      } else {
        console.log(err);
        callback('Error::' + err.message);
      }
    });
  });
}