

module.exports = item => {
    var OAUTHURL    =   'https://accounts.google.com/o/oauth2/auth?';
        var VALIDURL    =   'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=';
        var SCOPE       =   'https://www.googleapis.com/auth/userinfo.profile';
        var CLIENTID    =   '433322211111.apps.googleusercontent.com';
        var REDIRECT    =   'http://localhost:8888/MAMP/html5/oauth/'
        var TYPE        =   'token';
        var _url        =   OAUTHURL + 'scope=' + SCOPE + '&client_id=' + CLIENTID + '&redirect_uri=' + REDIRECT + '&response_type=' + TYPE;

    return {
        _url
    }
}