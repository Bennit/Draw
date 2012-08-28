/**
 * Server-side implementation of now.fx.js.
 * now.fx.js combines the clarity of reactive programming with the power of
 * the now.js xmlrpc library.
 * 
 * @author Ben Corne
 */
GLOBAL.nowfx = (function(my){
    
    var nowjs = require('now');//use our custom now version in /libs
    var everyone = undefined;//init later
    
    /**
     * Populate target's event streams: connectE, disconnectE
     * based on the source group.
     * 
     * @param source A now Group from which events are streamed
     * @param target An object in which the event streams are placed.
     */
    function initGroup(source,target) {
        
        // Capture user connect events and emit to the target stream
        target.connectE = receiverE();
        source.connected(function() {
            target.connectE.sendEvent({user:this.user,now:this.now});});
        
        // Capture user disconnect events and emit to the target stream
        target.disconnectE = receiverE();
        source.disconnected(function(){
            target.disconnectE.sendEvent(this.user);});
        
        // Capture user join events and emit to the target stream
        target.joinE = receiverE();
        source.on('join',function() {
            target.joinE.sendEvent({user:this.user,now:this.now});});
            
        // Capture user leave events and emit to the target stream
        target.leaveE = receiverE();
        source.on('leave',function() {
            target.leaveE.sendEvent(this.user);});
        
        target.leftE = receiverE();
        source.on('left',function() {
            target.leftE.sendEvent(this.user);});
        
    }
    
    /* PUBLIC API */
    
    /**
     * Initialize the flapjax extension for now. Should be called
     * before anything else is done with the module and after the app
     * or httpServer is configured.
     * 
     * @param httpServer The node.js httpServer or express app.
     */
    my.initialize = function(httpServer) {
        everyone = nowjs.initialize(httpServer);
        // Populate connectE and disconnectE streams.
        initGroup(everyone,my);
        my.everyone = everyone.now;
    };
    
    /**
     * Broadcast an operation to every client by referencing fields of this
     * element. Defined in now.js, init by initialize.
     */
    my.everyone = null;
    
    /**
     * Accesses a single client by its clientId, which is simply the
     * this.user.clientId of the client.
     * @see now.getClient
     */
    my.getClient = nowjs.getClient;
    
    
    /**
     * Create a group of clients. Custom groups, just like the everyone group,
     * also have a connectE and disconnectE stream.
     * @see now.getGroup
     */
    my.getGroup = function(id) {
        var group = nowjs.getGroup(id);
        // initialize the streams if the group was newly created.
        if(typeof group.connectE == "undefined")
            initGroup(group,group);
        return group;
    }
    
    /**
     * Stream containing events with {user,now} objects of newly
     * connected users.
     * Defined by initGroup.
     */
    my.connectE = null;
    
    /**
     * Stream containing events with now User objects of disconnected users.
     * Defined by initGroup.
     */
    my.disconnectE = null;
    
    /**
     * Create a stream that receives operations. Arguments
     * passed to this operation will be bound to the given parameters
     * in an object passed as event to the stream.
     * 
     * @param operation The operation clients calls to trigger an event.
     * @param ... Strings for the parameters this request has.
     */
    my.receiveE = function (operation) {
        // create the receiving stream for requests of type operation
        var recE = receiverE();
        
        // Fix the indexes -> lower by one for faster runtime mapping
        // The arguments object maps indices as strings to values.
        // Alternative: use explicit array as argument list on call&definition.
        var params = {};
        for(var idx_s in arguments) {
          idx = parseInt(idx_s);
          if(idx > 0) // skip the first index, which is the operation
            params[(idx-1).toString()] = arguments[idx_s];
        }
        
        // bind the operation to a function sending events
        everyone.now[operation] = function() {
            var request = {
              user:this.user,
              client:this.now,
              body:{}
            };
            for(var idx in arguments) {
                request.body[params[idx]] = arguments[idx];
            }
            recE.sendEvent(request);
        };
        return recE;
    };
    
    return my;
    
}({}));