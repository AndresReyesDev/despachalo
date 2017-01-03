// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '360173421008571', // your App ID
        'clientSecret'  : 'be03acf85fac1db1fb570c90b5229bad', // your App Secret
        'callbackURL'   : 'http://localhost:3000/onjobs/v1/auth/facebook/callback'
    },

    'linkedinAuth' : {
        'clientID'      : '78dp5hl8ui1dtu',
        'clientSecret'  : 'PMGJjYxOyyRd5Obf',
        'callbackURL'   : 'http://localhost:3000/onjobs/v1/auth/linkedin/callback'
    },

    'googleAuth' : {
        'clientID'      : '58748383734-6ret6tig9rpl340p29qjvmhphs7tou7u.apps.googleusercontent.com',
        'clientSecret'  : 'k_TbTnHLusDxmDhGotxOjq9a',
        'callbackURL'   : 'http://localhost:3000/onjobs/v1/auth/google/callback'
    }

};