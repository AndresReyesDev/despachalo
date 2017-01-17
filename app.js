
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var logger = require('express-logger');

var config = require('./app/util/config');

var dev = false;
if(dev) {
	// Database
	host = config.development.database.host;
	dbPort = config.development.database.port;
	db = config.development.database.name;
	// Enviroment
	port = config.development.port;
	mongodbUri = 'mongodb://'+host+'/'+db;
} else {
	// Database
	user = config.production.database.user;
	pass = config.production.database.pass;
	host = config.production.database.host;
	dbPort = config.production.database.port;
	db = config.production.database.name;
	// Enviroment
	port = config.production.port;
	app.settings.env = 'production';
	mongodbUri = 'mongodb://'+user+':'+pass+'@'+host+':'+dbPort+'/'+db;
}

// Connect Database MongoDB With Mongoose
mongoose.connect(mongodbUri, function(err, res) {
  if (err) console.log('ERROR: Conectando con la BD: ' + err);
  else console.log('Conexión con la BD '+ app.settings.env +' - '+ db +' exitosa');
});

app.use(logger({path:'./app/logs/despachalo-logs.txt'}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.session({ secret: 'SECRET' }));

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);
require('./app/routes/routes')(app, passport);

app.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api of despachalo.com !' });   
});

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});
