// load all the things we need
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // GOOGLE Strategy
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();

                    // set all of the relevant information
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.name.givenName;
                    newUser.google.lastname = profile.name.familyName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    newUser.email = profile.emails[0].value; // for local user
                    newUser.name = profile.name.givenName; // for local user
                    newUser.lastname = profile.name.familyName; // for local user
                    newUser.provider = profile.provider; // for local user

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

    // LINKEDIN Strategy
    passport.use(new LinkedInStrategy({

        clientID        : configAuth.linkedinAuth.clientID,
        clientSecret    : configAuth.linkedinAuth.clientSecret,
        callbackURL     : configAuth.linkedinAuth.callbackURL,
        state           : true
    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their facebook id
            User.findOne({ 'linkedin.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();

                    // set all of the relevant information
                    newUser.linkedin.id = profile.id;
                    newUser.linkedin.token = token;
                    newUser.linkedin.name = profile.name.givenName;
                    newUser.linkedin.lastname = profile.name.familyName;
                    newUser.linkedin.email = profile.emails[0].value;

                    newUser.email = profile.emails[0].value; // for local user
                    newUser.name = profile.name.givenName; // for local user
                    newUser.lastname = profile.name.familyName; // for local user
                    newUser.provider = profile.provider; // for local user

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

    // FACEBOOK Strategy
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();
                    
                    // set all of the relevant information
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = token || '';
                    var name = profile.displayName.split(" ");
                    newUser.facebook.name = profile.name.givenName || name[0];
                    newUser.facebook.lastname = profile.name.familyName || name[1];
                    newUser.facebook.email = '';

                    newUser.email = ''; // for local user
                    newUser.name = profile.name.givenName || name[0];
                    newUser.lastname = profile.name.familyName || name[1];
                    newUser.provider = profile.provider; // for local user

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

};