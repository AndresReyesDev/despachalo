'use strict';
var soap = require('soap');
var Commune = require('../models/commune');
var RestClient = require('../util/wsClient/restClient');
var config = require('./config');
var fedexAPI = require('../../node_modules/shipping-fedex/lib/index');

module.exports = {
  rateCXP: rateCXP,
  rateCDCH: rateCDCH,
  rateFDX: rateFDX,
  shippo: shippo
};

function rateCXP (communeOrigin, communeDestination, weight, width, height, long, callback) {

  Commune.findOne({idDSPL:communeOrigin}, function (err, comOrigen) {
    if (!err && comOrigen.idCXP) {
      Commune.findOne({idDSPL:communeDestination}, function (err, comDestino){
        if (!err && comDestino.idCXP) {
            var url_cxp = config.services.chilexpress.tarificar + 'codOrigen='+comOrigen.idCXP+'&codDestino='+comDestino.idCXP+'&pesoPieza='+weight+'&anchoPieza='+width+'&altoPieza='+height+'&largoPieza='+long;

            RestClient.req(url_cxp, function(chunk, statusCode){
              console.log('StatusCode Tarificacion CXP (' + statusCode + ')');
              callback(chunk, 'cxp');
            });
        } else {
          notResopnseCXP(callback, 'destino');
          console.log('No se encontro la comuna Destino para CXP');
        }
      });
    } else {
      notResopnseCXP(callback, 'origen');
      console.log('No se encontro la comuna Origen para CXP');
    }
  });
}

function rateCDCH (communeOrigin, communeDestination, weight, width, height, long, callback) {

  Commune.findOne({idDSPL:communeOrigin}, function (err, comOrigen) {
    if (!err && comOrigen.nameCDCH) {
      Commune.findOne({idDSPL:communeDestination}, function (err, comDestino){
        if (!err && comDestino.nameCDCH) {
            var url_cdc = config.services.correoschile.tarificar;
            var volumen = width * height * long;
            var volumenBase = '5000';

            var args = { 
              usuario: config.services.correoschile.autenticacion.usuario,
              contrasena: config.services.correoschile.autenticacion.contrasena,
              consultaCobertura: {
                ComunaDestino: comDestino.nameCDCH,
                ComunaRemitente: comOrigen.nameCDCH,
                ImporteReembolso: '0',
                ImporteValorAsegurado: '0',
                Kilos: weight,
                NumeroTotalPieza: '1',
                PaisDestinatario: '056',
                PaisRemitente: '056',
                TipoPortes: 'P',
                Volumen: volumenBase
              }
            };

            soap.createClient(url_cdc, function(err, client) {
            if (!err && client) {
              client.consultaCobertura(args, function(err, result) {
                if (!err) {
                  console.log('StatusCode Tarificacion CDCH (200)');
                  callback(result, 'cdch');
                } else {
                  console.log(err);
                  callback('Error Method::' + err.message, 'cdch');
                }
              });
            } else {
              console.log('ERROR SERVICE :: ' + err);
              callback('Error Client::' + err.message, 'cdch');
            }
          });
        } else {
          console.log('No se encontro la comuna Destino para CDCH');
        }
      });
    } else {
      console.log('No se encontro la comuna Origen para CDCH');
    }
  });
}

function rateFDX (addressFrom, addressTo, parcel, callback) {

  var fedex = new fedexAPI({
    environment: 'sandbox', // or live
    debug: true,
    key: config.services.fedex.autenticacion.key,
    password: config.services.fedex.autenticacion.password,
    account_number: config.services.fedex.autenticacion.acountNumber,
    meter_number: config.services.fedex.autenticacion.meterNumber,
    imperial: true // set to false for metric
  });

    /**
   *  Rates
   */
  fedex.rates({
    ReturnTransitAndCommit: true,
    CarrierCodes: ['FDXE','FDXG'],
    RequestedShipment: {
      DropoffType: 'REGULAR_PICKUP',
      // CHANGE FOR SPECIFIC SERVICE
      //ServiceType: 'FEDEX_GROUND',
      PackagingType: 'YOUR_PACKAGING',
      Shipper: {
        Contact: {
          PersonName: 'Sender Name',
          CompanyName: 'Company Name',
          PhoneNumber: '5555555555'
        },
        Address: {
          StreetLines: [
            'Address Line 1'
          ],
          City: 'Collierville',
          StateOrProvinceCode: 'TN',
          PostalCode: '38017',
          CountryCode: 'US'
        }
      },
      Recipient: {
        Contact: {
          PersonName: 'Recipient Name',
          CompanyName: 'Company Receipt Name',
          PhoneNumber: '5555555555'
        },
        Address: {
          StreetLines: [
            'Address Line 1'
          ],
          City: 'Charlotte',
          StateOrProvinceCode: 'NC',
          PostalCode: '28202',
          CountryCode: 'US',
          Residential: false
        }
      },
      ShippingChargesPayment: {
        PaymentType: 'SENDER',
        Payor: {
          ResponsibleParty: {
            AccountNumber: fedex.options.account_number
          }
        }
      },
      PackageCount: '1',
      RequestedPackageLineItems: {
        SequenceNumber: 1,
        GroupPackageCount: 1,
        Weight: {
          Units: 'KG',
          Value: parcel.peso
        },
        Dimensions: {
          Length: parcel.largo,
          Width: parcel.ancho,
          Height: parcel.alto,
          Units: 'CM'
        }
      }
    }
  }, function(err, res) {
    if(!err) {

      /*console.log(':::::::::::::::: EXITO ::::::::::::::::');
      for (var i = res.RateReplyDetails.length - 1; i >= 0; i--) {
        console.log(res.RateReplyDetails[i]);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0]);
        // Total Tarificación
        //console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalNetChargeWithDutiesAndTaxes);
        console.log('---------------------------------------------------------');
        /*console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalBillingWeight);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalBaseCharge);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalFreightDiscounts);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalNetFreight);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalSurcharges);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalNetFedExCharge);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalTaxes);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalNetCharge);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalRebates);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalDutiesAndTaxes);
        console.log(res.RateReplyDetails[i].RatedShipmentDetails[0].ShipmentRateDetail.TotalNetChargeWithDutiesAndTaxes);
      };*/


      callback(res, 'fdx');
      
    } else {
      console.log(':::::::::::::::: ERROR ::::::::::::::::');
      console.log(err);
      callback('Error Method::' + err.message, 'fdx');
    }
  });

}

function shippo (addressF, addressT, parc, callback) {
  
  var shippo = require('shippo')('shippo_test_78492fc0d37f0df5579d61612dfc099d988a8f71');
  
  var addressFrom = {
    "object_purpose": "PURCHASE",
    "name": "Shawn Ippotle",
    "street1": "Calle 55 # 100 - 51",
    "city": addressF.ciudad,
    "state": addressF.estado,
    "zip": addressF.codigoPostal,
    "country": addressF.pais,
    "phone": "+1 555 341 9393",
    "email": "mvargas@formax.cl"
  };

  var addressTo = {
      "object_purpose": "PURCHASE",
      "name": "Mr Hippo",
      "street1": "AVENIDA SUECIA",
      "city": addressF.ciudad,
      "state": addressF.estado,
      "zip": addressF.codigoPostal,
      "country": addressF.pais,
      "phone": "+1 555 341 9393",
      "email": "mvargas@formax.cl"
  };

  var parcel = {
      "length": parc.largo,
      "width": parc.ancho,
      "height": parc.alto,
      "distance_unit": "cm",
      "weight": parc.peso,
      "mass_unit": "lb"
  }; + ''

  /*shippo.carrieraccount.list({ carrier: 'dhl_express' }, function(err, response) {
    // asynchronously called
    if (!err) {
      callback(response, 'dhl');
    } else {
      callback(err, 'dhl');
    }
  });*/

  shippo.shipment.create({
      "object_purpose": "PURCHASE",
      "address_from": addressFrom,
      "address_to": addressTo,
      "parcel": parcel,
      "async": false
  }, function(err, shipment){
      // asynchronously called
      if (!err) {
        callback(shipment, 'dhl');
      } else {
        callback(err, 'dhl');
      }
  });
}

function notResopnseCXP(callback, tipo){
  var xml = '<?xml version="1.0" encoding="UTF-8"?>'+
                      '<courier>'+
                          '<codEstado>-1</codEstado>'+
                          '<glsEstado>No existe comuna ' + tipo + '</glsEstado>'+
                          '<listaServicios>'+
                              '<codServicio>-1</codServicio>'+
                              '<glsServicio>No Service</glsServicio>'+
                              '<indPesoVolumetrico>0</indPesoVolumetrico>'+
                              '<pesoCalculo>0</pesoCalculo>'+
                              '<valorServicio>0</valorServicio>'+
                          '</listaServicios>'+
                          '<listaServicios>'+
                              '<codServicio>-1</codServicio>'+
                              '<glsServicio>No Service</glsServicio>'+
                              '<indPesoVolumetrico>0</indPesoVolumetrico>'+
                              '<pesoCalculo>0</pesoCalculo>'+
                              '<valorServicio>0</valorServicio>'+
                          '</listaServicios>'+
                      '</courier>';
  callback(xml, 'cxp');
}