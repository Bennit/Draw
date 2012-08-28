/**
 * changeB extracts behaviour from a given DOM element. The initial value is
 * the value of the DOM element.
 * 
 * @changeE event stream that carries change requests to the changeB behaviour.
 * @elem DOM element or the id for a DOM element
 * 
 * @author Ben Corne
 */
function changeB(changeE,elem) {
    var domObj;
    if(typeof elem === "string")
        domObj = document.getElementById(elem);
    else
        domObj = elem;
    
    // Make sure domObj displays the correct state
    changeE.mapE(function(val) { domObj.value = val; })
    
    // Extract manual change behaviour to domObj
    var elemB = extractValueB(domObj);
    
    // The behaviour is a mergery of programmatically changing values and of
    // manually changed values.
    return mergeE(elemB.changes(),changeE).startsWith(elemB.valueNow());
}