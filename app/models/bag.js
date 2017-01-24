var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Token = require('./token.js');
var config = require('../util/config.js');

var bag = new Schema({
	email: String,
	type: String,
	numQuote: String,
	purchased: { type: Date, default: Date.now }
});

var getQuotes = function (typeBag, callback){
    Token.findOne({name: typeBag}, function (err, token) {
      if (!err && token) {
        callback(null, token.numQuote);
      } else {
        callback(err, null);
        console.log('LOG: No existen tokens: ' + err);
      }
    });
}

var getToken = function (typeBag, callback){
    Token.findOne({name: typeBag}, function (err, token) {
      if (!err && token) {
        callback(null, token);
      } else {
        callback(err, null);
        console.log("LOG: Token doesn't exist: " + err);
      }
    });
}

module.exports = mongoose.model('Bag', bag);
module.exports.getQuotes = getQuotes;
module.exports.getToken = getToken;