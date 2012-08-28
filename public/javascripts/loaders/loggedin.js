/**
 * LOGGEDIN MODULE
 * 
 * This module implements functionality for the loggedin view.
 * 
 * // NOW.JS
 * now.logoutOk()           -- Notify client logout request was completed
 * now.createTableOk(id)    -- Notify client with the id of a created table
 * now.lobbyError(reason)   -- Notify client something went wrong
 * now.lobbyMessage(msg)    -- Send a message to the client's lobby
 * now.receiveDraw(page)    -- Supply client with the draw html code
 * now.updateTables(tables) -- Update the list of available tables
 * now.updateSaves(tables)  -- Update the list of available saved tabled
 * 
 * @author Ben Corne
 */
(function() {
    
    /**
     * now.logoutOk()
     * Load /login when logout ok is received.
     */
    var logoutOkE = nowfx.receiveE('logoutOk');
    jQuery('#lobby-inner').fxLoad(logoutOkE,{request:'get',url:'/login'});
    clicksE('action-logout').mapE(function(){now.logout();});
    
    /**
     * Process clicks on the menu items by showing/hiding the correct
     * DOM elements. We do this in a function to avoid scope littering.
     */
    (function() {
        // we make a creator function to avoid sharing variables from
        // distinct for-loop iterations.
        function createShowHider(show,hide) {
            return function() {
                jQuery(hide).hide();
                jQuery(show).show();
            };
        }
        // loop over actions and create jquery hide&show selectors for each
        // menu item.
        var actions = ['load','join','create'];
        for(var idx in actions) {
            var action = actions[idx];
            var show = '#lobby-'+action;
            var hide = '';
            for(var idx2 in actions)
                if(idx2 != idx) {
                    hide = hide + '#lobby-'+actions[idx2]+',';
                }
            var showhide = createShowHider(show,hide);
            // Bind click events on the menu items to showhide function.
            // don't use clicksE here because it will stop the loop if
            // action-load is not found, which is the case for guests.
            jQuery('#action-'+action).fj('extEvtE','click').mapE(showhide);
        }
    }());
    
    // Lobby failure or success messages, displayed under the lobby
    var failOrSuccessE = receiverE();
    insertDomB(failOrSuccessE.startsWith(''),'lobby-problem');
    
    /**
     * now.createTableOk(id)
     * Request the drawing page for the table corresponding the received id.
     */
    var createTableOkE = nowfx.receiveE('createTableOk','id');
    createTableOkE.mapE(function(r){
        failOrSuccessE.sendEvent('Table created. Loading...');
        now.getDraw(r.id);
    });
    
    /**
     * now.lobbyMessage(id)
     */
    nowfx.receiveE('lobbyMessage','msg').mapE(function(r){
       failOrSuccessE.sendEvent(r.msg);
    });
    // Reset the fail/success message when someone clicks inside the lobby
    jQuery('#lobby :not(#lobby-problem-wrapper)')
        .fj('extEvtE','click').mapE(function(){failOrSuccessE.sendEvent('');});
    
    /**
     * now.lobbyError(reason)
     * Notify user that something went wrong in the lobby.
     */
    var lobbyErrorE = nowfx.receiveE('lobbyError','reason');
    lobbyErrorE.mapE(function(r){
        failOrSuccessE.sendEvent(
            SPAN({className:'lobby-problem'},r.reason));});
    
    /**
     * now.receiveDraw(page)
     * Show the received html of requesting a drawing page.
     */
    var receiveDrawE = nowfx.receiveE('receiveDraw','page');
    receiveDrawE.mapE(function(r){
        jQuery('#lobby').hide();
        jQuery('body').append(r.page);
    });
    
    /**
     * Request creation of a table when user clicks 'start drawing'
     */
    // Behaviour containing the width & height entered in the create form.
    var createDetailsB = jQuery.fxMultiExtValB({
        width:'#create-width',height:'#create-height'});
    function createTable(details) {
        now.createTable(details.width,details.height);
    }
    clicksE('action-create-confirm')
        .snapshotE(createDetailsB).mapE(createTable);
        
        
    /**
     * now.updateTables(tables)
     * Update the list of available tables.
     */
    var defaultTables = 'Noone is drawing. Le sad :(';
    function htmlifyTables(r) {
        if(r.tables.length == 0)
            return defaultTables;
        // create a div for each table
        function htmlify(t) { return DIV({className:'draw-table',title:t.id},
            t.name+' ('+t.width+'x'+t.height+') ['+t.userCount+' users]')}
        // put them in an array for .apply
        var tables = new Array();
        for(var idx in r.tables)
            tables.push(htmlify(r.tables[idx]));
        // add all tables as children to a div
        return DIV.apply({},tables);
    }
    // Create behaviour that represents the table list
    var tablesB = nowfx.receiveE('updateTables','tables') // receive updates
        .mapE(htmlifyTables) //create browser-readable elements
        .startsWith('Hit refresh to load the tables.');
    insertDomB(tablesB,'join-tables');// insert the behaviour
    // Update the join-triggering event streams when the behaviour changes
    tablesB.changes().mapE(function(){
        jQuery('#lobby-join div.draw-table').fj('extEvtE','click')
          .mapE(function(c) {
            // We abused the title field to hold the table id value without
            // showing it. This is because DIV doesn't allow us to add
            // non-property attributes. See:
            // http://www.javascriptkit.com/domref/elementproperties.shtml
            var tid = parseInt(c.target.title);
            now.getDraw(tid);
          });
    });
       
    // initial update of table list
    now.updateMyTables();
    // update tables on refresh click
    clicksE('action-refresh').mapE(function(){now.updateMyTables();});
    
    /** 
     * now.updateSaves(saves)
     * Update the list of available saved tabled
     */
    var defaultSaves =
            "The Sistine Chapel Ceiling is under construction.\n\n"+
            "You'll see your creations in this list when you save them."; 
    function htmlifySaves(r) {
        if(r.saves.length == 0)
            return defaultSaves;
        // create a div for each table
        function htmlify(t) { return DIV({className:'draw-table',title:t.name},
            t.name+' ('+t.width+'x'+t.height+') ['+t.date+']')}
        // put them in an array for .apply
        var saves = new Array();
        for(var idx in r.saves)
            saves.push(htmlify(r.saves[idx]));
        // add all tables as children to a div
        return DIV.apply({},saves);
    }
    var savesB = nowfx.receiveE('updateSaves','saves')
        .mapE(htmlifySaves) // create browser-readable elements
        .startsWith(defaultSaves);
    insertDomB(savesB,'load-tables');
    // each time the saves behaviour changes we reload the click event streams
    savesB.changes().mapE(function() {
        jQuery('#lobby-load div.draw-table').fj('extEvtE','click')
          .mapE(function(c) { now.loadDraw(c.target.title) });
    })
    // initial update of saves list
    now.updateMySaves();
    
    
}())