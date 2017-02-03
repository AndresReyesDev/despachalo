'use strict';
var soap = require('soap');
var config = require('./config');

module.exports = {
  processDteFactura: processDteFactura,
  processDteBoleta: processDteBoleta
};

// Empresa - Factura
function processDteFactura (xmlBasico, folio, callback) {
	var url_ticket = config.ticket.url;

  var args = { 
    rut: config.ticket.rut,
    clave: config.ticket.clave,
    xml2: '<![CDATA['+xmlBasico+']]>',
    ambiente: config.ticket.ambiente,
    asignafolio: folio,
    adicionales: ''
  };

  soap.createClient(url_ticket, function(err, client) {
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
function processDteBoleta (xmlBasico, folio, callback) {
  var url_ticket = config.ticket.url;

  var args = { 
    rut: config.ticket.rut,
    clave: config.ticket.clave,
    xml2: '<![CDATA['+xmlBasico+']]>',
    ambiente: config.ticket.ambiente,
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