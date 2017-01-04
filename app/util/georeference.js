'use strict';
var soap = require('soap');
var restClient = require('./wsClient/restClient');
var config = require('./config');

module.exports = {
  regionsCXP: regionsCXP,
  communesCXP: communesCXP,
  regionsCDCH: regionsCDCH,
  communesCDCH: communesCDCH
};

function regionsCXP (callback) {
	var url_cxp = config.services.chilexpress.georeferencia.regiones + '?format=json';

  restClient.req(url_cxp, function(chunk, statusCode){
    console.log('StatusCode Regiones CXP (' + statusCode + ')');
    callback(chunk);
  });
}

function communesCXP (callback) {
  console.log('ComunasCXP');
  var url_cxp = config.services.chilexpress.georeferencia.comunas + '?codregion=99&format=json';

  restClient.req(url_cxp, function(chunk, statusCode){
    console.log('StatusCode Regiones CXP (' + statusCode + ')');
    callback(chunk);
  });
}

function regionsCDCH (callback) {
	var url_cdc = config.services.correoschile.georeferencia;

  var args = { 
    usuario: config.services.correoschile.autenticacion.usuario,
    contrasena: config.services.correoschile.autenticacion.contrasena
  };

  soap.createClient(url_cdc, function(err, client) {
    client.listarTodasLasRegiones(args, function(err, result) {
      if (!err) {
        callback(result);
      } else {
        console.log(err);
        callback('Error::' + err.message);
      }
    });
  });
}

function communesCDCH (callback) {
  console.log('ComunasCDCH');
  var url_cdc = config.services.correoschile.georeferencia;

  var args = { 
    usuario: config.services.correoschile.autenticacion.usuario,
    contrasena: config.services.correoschile.autenticacion.contrasena
  };
  soap.createClient(url_cdc, function(err, client) {
    client.listarTodasLasComunas(args, function(err, result) {
      if (!err) {
        callback(result);
      } else {
        console.log(err);
        callback('Error::' + err.message);
      }
    });
  });
}