module.exports = function (app, passport) {

	var UserController = require('../controllers/userController');
	var BagController = require('../controllers/bagController');
	var AddressController = require('../controllers/addressController');
	var TokenController = require('../controllers/tokenController');
	var PermissionController = require('../controllers/permissionController');
	var RatesController = require('../controllers/ratesController');
	var RatesIntController = require('../controllers/ratesIntController');

	var PuntoPagosController = require('../controllers/puntoPagosController');

	//var TicketController = require('../controllers/ticketController');

	var GeoCommuneController = require('../controllers/geoCommuneController');
	var GeoCountryController = require('../controllers/geoCountryController');
	var GeoProvinceController = require('../controllers/geoProvinceController');
	var GeoRegionController = require('../controllers/geoRegionController');

	var jwtController = require('../controllers/jwtController');

	// Usuarios
	app.post('/desp/v1/users/login', UserController.userLogin);

	app.get('/desp/v1/users', UserController.findUsers);
	app.post('/desp/v1/users', UserController.findUserByEmail);
	app.put('/desp/v1/users', UserController.updateUser);
	app.delete('/desp/v1/users', UserController.deleteUser);

	// User types
	app.get('/desp/v1/users/types', UserController.findTypesUser);
	app.post('/desp/v1/users/types', UserController.findTypeUser);

	// User Adminitrador
	app.post('/desp/v1/users/add', UserController.addUser);
	app.get('/desp/v1/users/reset/password', UserController.userResetPassword);

	// User Client
	app.post('/desp/v1/users/register', UserController.userRegister);
	app.get('/desp/v1/users/validate/email', UserController.userValidateEmail);

	// Bags
	app.get('/desp/v1/bags', BagController.findBags);
	app.get('/desp/v1/bag', BagController.findBag);
	app.post('/desp/v1/bag', BagController.addBag);

	// Address
	app.get('/desp/v1/addresses', AddressController.findAllAddresses);
	app.get('/desp/v1/address', AddressController.findAddress);
	app.post('/desp/v1/address', AddressController.addAddress);
	app.put('/desp/v1/address', AddressController.updateAddress);
	app.delete('/desp/v1/address', AddressController.deleteAddress);

	// Token
	app.get('/desp/v1/token', TokenController.findToken);
	app.post('/desp/v1/token', TokenController.addToken);
	app.put('/desp/v1/token', TokenController.updateToken);
	app.delete('/desp/v1/token', TokenController.deleteToken);

	// Permission
	app.get('/desp/v1/permission', PermissionController.findPermission);
	app.post('/desp/v1/permission', PermissionController.addPermission);
	app.put('/desp/v1/permission', PermissionController.updatePermission);
	app.delete('/desp/v1/permission', PermissionController.deletePermission);

	// Rates
	app.get('/desp/v1/rates', RatesController.getRates);
	app.post('/desp/v1/rates', RatesController.rates);

	// Rates Int
	app.get('/desp/v1/rates/international', RatesIntController.getRatesInt);
	app.post('/desp/v1/rates/international', RatesIntController.ratesInt);

	// Punto Pagos
	app.post('/desp/v1/puntopagos/pagar', PuntoPagosController.pagar);
	app.get('/desp/v1/puntopagos/notificacion', PuntoPagosController.getNotificacion); // SandBox
	app.post('/desp/v1/puntopagos/notificacion', PuntoPagosController.postNotificacion); // Producción

	// Boleta Electronica
	//app.post('/desp/v1/ticket/invoice', TicketController.processDteInvoice);
	//app.post('/desp/v1/ticket/ballot', TicketController.processDteBallot);

	// Georeference
	app.get('/desp/v1/geo/communes', GeoCommuneController.geoCommunes);
	app.get('/desp/v1/geo/countries', GeoCountryController.geoCountries);
	app.get('/desp/v1/geo/provinces', GeoProvinceController.geoProvinces);
	app.get('/desp/v1/geo/regions', GeoRegionController.geoRegions);

	// Json Web Token
	app.post('/desp/v1/jwtoken', jwtController.resetToken);
	app.get('/desp/v1/jwtoken', jwtController.generateToken);

	// Google Authentication
    app.get('/desp/v1/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/desp/v1/auth/google/callback', passport.authenticate('google'), jwtController.generateSocialTokenUser);

    // Facebook Authentication
    app.get('/desp/v1/auth/facebook', passport.authenticate('facebook'));
	app.get('/desp/v1/auth/facebook/callback',passport.authenticate('facebook'), jwtController.generateSocialTokenUser);
};