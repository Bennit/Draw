/**
 * LOGIN CONTROLLER
 * 
 * Implements the now.js interface for performing a login and requesting the
 * loggedin view.
 * 
 * // NOW.JS
 * now.login(nickname) -- Request login
 * now.guestLogin() -- Request guest login
 * now.getLoggedin() -- Request /loggedin page
 * 
 * @author Ben Corne
 **/
(function(){
       
    var jade = require('jade'),
        fs = require('fs');
        
    var jLoggedin = jade.compile(
        fs.readFileSync('./views/loggedin.jade','utf8'));
    var nologin = jade.compile(
        fs.readFileSync('./views/nologin.jade','utf8'))({});
    
    nowfx.connectE.mapE(function(e){
       e.user.user = false;//init the logged in user to false 
    });
    
    /**
     * now.getLoggedin()
     */
    function getLoggedin(request) {
        var user = request.user.user;
        if(user)
            request.client.receiveLoggedin(jLoggedin({user:user}));
        else
            request.client.receiveLoggedin(nologin);
    }
    var getLoggedinE = nowfx.receiveE('getLoggedin');
    getLoggedinE.mapE(getLoggedin);

    
    /**
     * Finish succeeded login requests
     */
    function finishLogin(request,user) {
        // Reset the table the user was on, in case of disconnect.
        user.current = false;
        // Set the now#User.user property for later identification
        request.user.user = user;
        // Tell the client the login was successful
        request.client.loginOk();
    }
       
    /**
     * now.login(nickname)
     */
    function normalLogin(request) {
        var user = UserManager.getUser(request.body.nickname);
        if(user)
            finishLogin(request,user);
        else {
            request.client.loginError('User doesn\'t exist.');
        }
    }
    var loginE = nowfx.receiveE('login','nickname');
    loginE.mapE(normalLogin);
    
    /**
     * now.guestLogin(nickname)
     */
    function guestLogin(request) {
        var user = UserManager.addGuest();
        finishLogin(request,user);
    }    
    var guestLoginE = nowfx.receiveE('guestLogin');
    guestLoginE.mapE(guestLogin);
    
}())
 