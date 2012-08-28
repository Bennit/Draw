/**
 * LOGIN MODULE
 * 
 * This module implements functionality for the login view. This means logging
 * in users and reporting problems / redirecting on success.
 * 
 * // NOW.JS
 * now.loginOk() -- Signal client login succeeded
 * now.loginError(reason) -- Signal client login failed.
 * 
 * @author Ben Corne
 */
(function() {
  
  /**
   * Report on login request results
   */
  var loginResultE = receiverE();
  insertDomB(loginResultE.startsWith(''),'lobby-login-problem');
  
  /**
   * Receive loginOk requests from the server, indicating a login request
   * was successfully completed. Load /loggedin on event.
   */
  nowfx
    .receiveE('loginOk')
    .mapE(function(){
      loginResultE.sendEvent('Login verified. Loading...');
      now.getLoggedin();});
  
  /**
   * Server sent us to /loggedin page so we show it.
   */
  nowfx
    .receiveE('receiveLoggedin','page')
    .mapE(function(request) {jQuery('#lobby-inner').html(request.page);});
  
  /**
   * Receive loginError requests from the server, indicating a login request
   * has failed.
   */
  nowfx
    .receiveE('loginError','reason')
    .mapE(function(request){ loginResultE.sendEvent(
        SPAN({className:'lobby-problem'},request.reason));})
      
  /**
   * When a user clicks login button, do a login request to the server.
   */
  function login(nickname) { now.login(nickname); };
  clicksE('action-login').snapshotE($B('nickname')).mapE(login);
  
  /**
   * When a user clicks the register link, load the register page.
   */
  jQuery('#lobby-inner').fxLoadOnClick(
        '#action-go-register',
        {request: 'get',url: '/register'});
  
  /**
   * When a user clicks draw as guest, do a guest login request to the server.
   */
  function guestLogin() { now.guestLogin(); };
  clicksE('action-guest-login').mapE(guestLogin);
  
}());