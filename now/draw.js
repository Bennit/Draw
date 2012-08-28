/**
 * DRAW CONTROLLER
 * 
 * Implements the now.js interface for users on a drawing table
 * 
 * // NOW.JS
 * now.getDraw(id)    -- Render and return the given drawing table
 * 
 * now.leaveDraw()       -- Leave the currently joined drawing table
 * now.saveDraw(name)    -- Save the table under the given name for now.user
 * now.loadDraw(name)     -- Load the table with the given name for now.user
 * 
 * now.chatWithDraw(msg)  -- Send the message to all clients in this table
 * 
 * now.addShape(shape)    -- Add a shape to the drawing
 * now.removeShape(id)    -- Remove the shape with the given id from the drawing
 * now.updateShape(shape) -- Replace the corresponding shape with the given one
 * now.moveDownShape(id)  -- Move a shape down a layer
 * now.moveUpShape(id)    -- Move a shape up a layer * 
 * 
 * @author Ben Corne
 */
(function() {
    
    var jade = require('jade'),
        fs = require('fs');
        
    var jDraw = jade.compile(fs.readFileSync('./views/draw.jade','utf8'));
    
    /**
     * now.getDraw(id)
     */
    function getDraw(r) {
        var table = TableManager.getTable(r.body.id);
        // check if the requested table exists
        if(!table)
            r.client.lobbyError('Table '+r.body.id+' not found.');
        // check if the user is already in a table
        else if(r.user.user.current) {
            r.client.lobbyError('You are already drawing!');
        }
        // Everything is OK!
        else {
            // add the user to the table
            table.addClient(r.user);
            // render the page and send it to the client
            r.client.receiveDraw(jDraw({
                user:r.user.user,
                width:table.width,
                height:table.height,
                shapes:JSON.stringify(table.shapes)
            }));
        }
    }
    var getDrawE = nowfx.receiveE('getDraw','id');
    getDrawE.mapE(getDraw);
    
    /**
     * now.leaveDraw()
     */
    var leaveDrawE = nowfx.receiveE('leaveDraw');
    leaveDrawE.mapE(function(r){
        r.client.lobbyMessage('Left table '+r.user.user.current.id);
        // remove the user from it's current table
        r.user.user.current.removeClient(r.user);
    });
    
    /**
     * now.saveDraw(name)
     */
    var saveDrawE = nowfx.receiveE('saveDraw','name');
    saveDrawE.mapE(function(r){
       r.user.user.saveTable(r.body.name);
       r.client.updateSaves(r.user.user.getSaves());
       r.client.saveDrawOk();
    });
    
    /**
     * now.loadDraw(name)
     */
    function loadDraw(r) {
        var save = r.user.user.getSave(r.body.name);
        if(save) {
            var t = TableManager.loadTable(save);
            r.client.createTableOk(t.id);
        } else {
            console.log('Save not found for user: '+r.body.name);
            //NOTE: the user gets notified the load failed by getTable
        }
    }
    var loadDrawE = nowfx.receiveE('loadDraw','name');
    loadDrawE.mapE(loadDraw);
    
    /**
     * now.chatWithDraw(message)
     */
    function chatWithDraw(r) {
        var user = r.user.user;
        user.current.now.receiveDrawChat(user.nickname,r.body.message);
    }
    var chatWithDrawE = nowfx.receiveE('chatWithDraw','message');
    chatWithDrawE.mapE(chatWithDraw);

    /**
     * Update the client-side shapes of the users connected to the given table.
     */
    function updateShapes(table) {
        table.now.updateShapes(table.shapes);
    }
    
    /**
     * now.addShape(shape)
     */
    var addShapeE = nowfx.receiveE('addShape','shape');
    function addShape(r) {
        var table = r.user.user.current;
        table.addShape(r.body.shape);
        return table;
    }
    // add the shape then update the table's user's shapes
    addShapeE.mapE(addShape).mapE(updateShapes);
    
    /**
     * now.removeShape(id)
     */
    var removeShapeE = nowfx.receiveE('removeShape','id');
    function removeShape(r) {
        var table = r.user.user.current;
        table.removeShape(r.body.id);
        return table;
    }    
    // remove the shape then update the table's user's shapes
    removeShapeE.mapE(removeShape).mapE(updateShapes);
    
    /**
     * now.updateShape(shape)
     */
    var updateShapeE = nowfx.receiveE('updateShape','shape');
    function updateShape(r) {
        var table = r.user.user.current;
        table.updateShape(r.body.shape);
        return table;
    }
    updateShapeE.mapE(updateShape).mapE(updateShapes);
    
    /**
     * now.moveDownShape(id)
     */
    var moveDownShapeE = nowfx.receiveE('moveDownShape','id');
    function moveDownShape(r) {
        var table = r.user.user.current;
        table.moveDownShape(r.body.id);
        return table;
    }
    moveDownShapeE.mapE(moveDownShape).mapE(updateShapes);
    
    /**
     * now.moveUpShape(id)
     */
    var moveUpShapeE = nowfx.receiveE('moveUpShape','id');
    function moveUpShape(r) {
        var table = r.user.user.current;
        table.moveUpShape(r.body.id);
        return table;
    }
    moveUpShapeE.mapE(moveUpShape).mapE(updateShapes);
    
}());