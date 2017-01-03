var fs = require('fs');
var check = require('syntax-error');

// Escoge el fichero que deseas analisar
var file = '../api/controllers/user.js';
var src = fs.readFileSync(file);

var err = check(src, file);
if (err) {
	console.error(Array(76).join('-'));
    console.error('ERROR DETECTED');
    console.error(err);
    console.error(Array(76).join('-'));
}