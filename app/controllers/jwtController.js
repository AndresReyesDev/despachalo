var jwt    = require('jsonwebtoken');
var config = require('../util/config');
var User = require('../models/user');

//GET - Return token for use services
exports.generateToken = function(req, res) {
    
    var tokenUser = {
        id: '000'
    }
	var token = jwt.sign(tokenUser, config.jwt.secret, {
      expiresIn: '1h'
    });
    tokenUser.token = token;
    res.status(200).send({code: 200,desc: "Temporary token ",content: {token}});
};

//GET - Return token for use services
exports.generateSocialTokenUser = function(req, res) {
    
    User.findById(req.user.id, function (err, user) {
        if(err) {
            res.send({ code: 1, desc: 'User ID not found :: ' + err.message});
        } else {
            if (user) {
                var tokenUser = {
                    id: req.user.id,
                    email: req.user.email
                }
                var token = jwt.sign(tokenUser, config.jwt.secret, {
                  expiresIn: '1d'
                });
                user.token = token;
                console.log(user);
                user.save(function (err, u) {
                    if (!err) {
                        res.send(u);
                    } else {
                        res.status(500).send({ code: 5000, descripcion: 'Token not save, login social error in generateSocialTokenUser'});
                        console.log('ERROR: ' + err);
                    }
                });
            } else {
                res.status(404).send({ code: 404, desc: "User doesn't exist"});
            }
        }
    });
};

//GET - Return token for use services
exports.resetToken = function(req, res) {
    console.log(req);
    if (req.body.email) {
        var tokenUser = {
            email: req.body.email
        }
        var token = jwt.sign(tokenUser, config.jwt.secret, {
          expiresIn: '1d' // espires in 24 hours
        });
        tokenUser.token = token;
        res.send(tokenUser);
    } else {
        res.status(400).send({ code: 400, desc: "User email is required"});
    }
};