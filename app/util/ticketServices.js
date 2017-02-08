'use strict';
var soap = require('soap');
var config = require('./config');

module.exports = {
  processDteFactura: processDteFactura,
  processDteBoleta: processDteBoleta,
  getDteBoletaPDF: getDteBoletaPDF
};

// Empresa - Factura
function processDteFactura (xmlBasico, adicionales, callback) {
	var url_ticket = config.ticket.url;

  var args = { 
    rut: config.ticket.rut,
    clave: config.ticket.clave,
    xml2: xmlBasico,
    ambiente: config.ticket.ambiente,
    asignafolio: config.ticket.asignafolio,
    adicionales: adicionales
  };

  soap.createClient(url_ticket, function(err, client) {
    client.procesadte(args, function(err, result) {
      if (!err) {
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  });
}

// Cliente - Boleta
function processDteBoleta (xmlBasico, adicionales, callback) {
  var url_ticket = config.ticket.url;

  var args = { 
    rut: config.ticket.rut,
    clave: config.ticket.clave,
    xml2: xmlBasico,
    ambiente: config.ticket.ambiente,
    asignafolio: config.ticket.asignafolio,
    adicionales: adicionales
  };

  soap.createClient(url_ticket, function(err, client) {
    client.procesadteBoleta(args, function(err, result) {
      if (!err) {
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  });
}

function getDteBoletaPDF (folio, callback) {
  var url_ticket = config.ticket.url;

  var args = { 
    rut: config.ticket.rut,
    clave: config.ticket.clave,
    productivo: config.ticket.ambiente,
    tipodte: config.ticket.tipoDteBoleta,
    folio: folio,
    cedible: config.ticket.cedible
  };

  soap.createClient(url_ticket, function(err, client) {
    client.consultapdf(args, function(err, result) {
      if (!err) {
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  });
}