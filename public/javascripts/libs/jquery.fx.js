/**
 * Flapjax bindings for jQuery elements
 * 
 * @depends flapjax.js 2.1
 * @depends jquery.js 1.6.2
 * @depends jquery-flapjax.js
 * 
 * @author Ben Corne
 */

/** 
 * Load html content into a jQuery element when events are received.
 * Comparable to ajax+jQuery.replaceWith.
 * 
 * @param activateE Activation event stream. Events passed to replaceRequest.
 * @param replaceRequest getWebServiceObjectE request or function that generates one.
 * @returns receiverE of events when content is loaded.
 */
jQuery.fn.fxLoad = function (activateE,replaceRequest) {
  var loadSelector = this;
  if(typeof replaceRequest.async === "undefined")
      replaceRequest.async = true;//default async to true to avoid block
  var loadRequestE = activateE.mapE((replaceRequest instanceof Function) ?
    replaceRequest : function(_){return replaceRequest;});
  var loadResponseE = getWebServiceObjectE(loadRequestE);
  var loadedE = receiverE();
  loadResponseE.mapE(function(resp) {
    loadSelector.html(resp);
    loadedE.sendEvent(true);
  });
  return loadedE;
};

/**
 * Loads html content into a jQuery element when a jQuery element is clicked.
 * 
 * @param clickSelector jQuery selector activating load on click event.
 * @param replaceRequest getWebServiceObjectE request or function that generates one.
 * @returns receiverE of events when content is loaded.
 * 
 * @see jQuery.fn.fxLoad
 */
jQuery.fn.fxLoadOnClick = function (clickSelector,replaceRequest) {
  return this.fxLoad(
    jQuery(clickSelector).fj('extEvtE','click'),
    replaceRequest);
};

/**
 * Start a timer and display it's value in current jQuery element.
 * 
 * @param seconds Time in seconds to time. 
 * @returns receiverE that receives an event when seconds has passed.
 */
jQuery.fn.fxTimer = function(seconds,updateInterval) {
  //TODO
};

/**
 * Creates a behaviour where the values are object with the given keys mapped
 * to their current value.
 * 
 * @param mapping A mapping from keys to fields carrying their current value
 */
jQuery.fxMultiExtValB = function(mapping) {
  if(!mapping instanceof Object)
    throw 'fxMultiExtValB: mapping must be an object';
  var keys = [];
  var fields = [];
  var idx = 0;
  for(var field in mapping) {
    keys[idx] = field;
    fields[idx] = jQuery(mapping[field]).fj('extValB');
    if(!fields[idx])
      throw 'fxMultiExtValB: Invalid selector: '+mapping[field];
    idx++;
  };
  function makeFields() {
    var fields = {};
    for(var i = 0; i < idx; i++) {
      fields[keys[i]] = arguments[i];
    };
    return fields;
  };
  return liftB.apply({},[makeFields].concat(fields));
};