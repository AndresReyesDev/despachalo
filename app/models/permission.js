var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var permission = new Schema({
	typeUser: String,
	createUser: { type: Boolean, default: true },
	editUser: { type: Boolean, default: true },
	editPermission: { type: Boolean, default: true },
	resetPassword: { type: Boolean, default: true }
});

module.exports = mongoose.model('Permission', permission);