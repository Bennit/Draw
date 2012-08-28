/**
 * Client-side implementation of now.fx.js.
 * now.fx.js combines the clarity of reactive programming with the power of
 * the now.js xmlrpc library.
 * 
 * @author Ben Corne
 */
window.nowfx = (function(my){
    
    my.now = now;
    
    /**
     * Create a stream that receives operations. Arguments
     * passed to this operation will be bound to the given parameters
     * in an object passed as event to the stream.
     * 
     * @param operation The operation server calls to trigger an event.
     * @param ... Strings for the parameters this request has.
     */
    my.receiveE = function (operation) {
        // create the receiving stream for requests of type operation
        var recE = receiverE();
        
        // Fix the indexes -> lower by one for faster runtime mapping
        // The arguments object maps indices as strings to values.
        var params = {};
        for(var idx_s in arguments) {
          idx = parseInt(idx_s);
          if(idx > 0) // skip the first index, which is the operation
            params[(idx-1).toString()] = arguments[idx_s];
        }
        
        // bind the operation to a function sending events
        now[operation] = function() {
            var request = {};
            for(var idx in arguments) {
                request[params[idx]] = arguments[idx];
            }
            recE.sendEvent(request);
        };
        return recE;
    };
    
    /**
     * Event stream indicating once when the connection with the now server
     * is established.
     */
    my.readyE = receiverE();
    
    /**
     * Event stream indicating connection with the server was lost.
     */
    my.disconnectE = receiverE();
    
    /**
     * Initialize the nowfx library.
     */
    now.ready(function(){
        // now.ready == now.core.socketio 'connect' event
        my.readyE.sendEvent(true);
        // signal the disconnect stream on disconnect
        now.core.socketio.on('disconnect',
            function(){ my.disconnectE.sendEvent(true);});
    });
    
    return my;
}({}));