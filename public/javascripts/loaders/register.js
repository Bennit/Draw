/**
 * REGISTER MODULE
 * 
 * This module implements functionality for the register view. Users can
 * fill in and submit register forms and get notified upon errors.
 * 
 * // NOW.JS
 * now.registrationOk() -- notify client of successful registration
 * now.registrationError(reason) -- notify client of failed registration.
 * 
 * @author Ben Corne 
 */
(function() {
  
  /**
   * Stream containing registration result.
   * @param result SPAN containing the textual representation of the result.
   */  
  var registrationResultE = receiverE();
  insertDomB(registrationResultE.startsWith(''),'lobby-register-problem');
  
  /**
   * Receive registrationOk requests from the server indicating registration
   * was successful. Show message on success.
   */
  var registrationOkE = nowfx.receiveE('registrationOk');
  registrationOkE.mapE(function(_) { registrationResultE.sendEvent(
      SPAN('Registration complete. You can now log in.')
  );});
  
  /**
   * Receive registrationError requests from the server indicating there was
   * a problem with the application.
   * @param reason The reason the request failed.
   */
  var registrationErrorE = nowfx.receiveE('registrationError','reason');
  registrationErrorE.mapE(function(request) { registrationResultE.sendEvent(
      SPAN({className:'lobby-problem'},request.reason)
  )});
  
  /**
   * Load /login when go-login is clicked.
   */
  jQuery('#lobby-inner').fxLoadOnClick('#action-go-login',
    {request:'get',url:'/login'});
    
  /**
   * Register the nickname if we click on register
   */
  var nicknameB = extractValueB('register-nickname');
  clicksE('action-register').snapshotE(nicknameB).mapE(function(nickname){
      now.register(nickname);
  });

}());