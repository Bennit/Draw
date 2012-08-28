/**
 * LOGGEDIN CONTROLLER
 * 
 * Implements the now.js interface for logged in users.
 * 
 * // NOW.JS
 * now.logout() -- Request logout
 * now.createTable(width,height) -- Create a new table with given dimensions.
 * now.updateMyTables() -- Ask server to send a table update to the client.
 * 
 * @author Ben Corne
 **/
(function(){
    
    /**
     * now.logout()
     */
    function logout(r) {
        r.user.user = false;
        r.client.logoutOk();
    }
    var logoutE = nowfx.receiveE('logout');
    logoutE.mapE(logout);
    
    /**
     * now.createTable(width,height)
     */
    function createTable(r) {
        var table = TableManager.addTable(
            r.user.user.nickname,r.body.width,r.body.height,[]);
        r.client.createTableOk(table.id);
        //r.client.lobbyError('Server table cap reached. Try again later.');
    }
    var createTableE = nowfx.receiveE('createTable','width','height');
    createTableE.mapE(createTable);
    

    /**
     * now.updateMyTables()
     */
    nowfx.receiveE('updateMyTables').mapE(function(r){
        r.client.updateTables(TableManager.getAllTables());
    });
    
    /**
     * now.updateMySaves()
     */
    nowfx.receiveE('updateMySaves').mapE(function(r) {
        r.client.updateSaves(r.user.user.getSaves());
    });
    
}())
 