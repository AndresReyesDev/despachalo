module.exports = function (app, passport) {

	var UserController = require('../controllers/userController');
	var jwtController = require('../controllers/jwtController');

	// Usuarios
	app.get('/onjobs/v1/users', UserController.findAllUsers);
	app.post('/onjobs/v1/users', UserController.addUser);
	app.get('/onjobs/v1/users/:id', UserController.findById);
	app.put('/onjobs/v1/users/:id', UserController.updateUser);
	app.delete('/onjobs/v1/users/:id', UserController.deleteUser);

	// Json Web Token
	app.post('/onjobs/v1/token/:id', jwtController.resetToken);
	app.get('/onjobs/v1/token', jwtController.generateToken);

	// Google Authentication
    app.get('/onjobs/v1/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    app.get('/onjobs/v1/auth/google/callback', passport.authenticate('google'), jwtController.generateSocialTokenUser);

    // Linkedin Authentication
    app.get('/onjobs/v1/auth/linkedin',passport.authenticate('linkedin'));
	app.get('/onjobs/v1/auth/linkedin/callback', passport.authenticate('linkedin'), jwtController.generateSocialTokenUser);

    // Facebook Authentication
    app.get('/onjobs/v1/auth/facebook', passport.authenticate('facebook'));
	app.get('/onjobs/v1/auth/facebook/callback',passport.authenticate('facebook'), jwtController.generateSocialTokenUser);
};