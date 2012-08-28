/**
 * Reusable flapjax bindings for express
 * @author bcorne
 */

/**
 * Requests can be sent to the server, resulting in an event.
 * We wrap this in a receiverE event stream and send requests as
 * events to this stream.
 * @param method get,post,delete,... (see express app API)
 * @param url /path/to/resource
 * @return the receiving stream for requests on METHOD url. 
 */
exports.requestE = function (app,method,url) {
  var reqE = receiverE();
  
  if(!method in app) {
    throw "No such request method:"+method;
  }
  
  app[method](
    url,
    function (req,res) {
      reqE.sendEvent({req:req,res:res});
    }
  );
  
  return reqE;
};