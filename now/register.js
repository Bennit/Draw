/**
 * REGISTER CONTROLLER
 * 
 * Implements the now.js interface for registering new users.
 * 
 * // NOW.JS
 * now.register(nickname) -- Request registration
 * 
 * @author Ben Corne
 **/
(function(){
    
    /**
     * now.register(nickname)
     */
    function register(request) {
        try {
            UserManager.addUser(request.body.nickname);
            request.client.registrationOk();
        } catch(e) {
            console.log('registration error: '+e.name+'\n\t'+e.message);
            request.client.registrationError(e.message)
        }
    }
    var registerE = nowfx.receiveE('register','nickname');
    registerE.mapE(register);
    
}())
 