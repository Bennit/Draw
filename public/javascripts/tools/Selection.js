/**
 * Tool -- Selection
 * 
 * Allows us to select shapes on the drawing and modify properties, move them,
 * delete them or move them up and down layers.
 * 
 * This tool relies on all shapes to implement isOn, copy and move.
 * 
 * @see tools/Template.js
 * @author Ben Corne
 */

Draw.tools.Selection = (function() {
   
   // The shape that is selected, is updated when a new shape is selected
   var shape = false;
   
   // Is there a shape selected?
   var shapeFilter = function() { return shape };
   
   // Are we on Selection mode?
   var modeFilter = Draw.modeFilter('Selection');
   
   /**
    * Creates an event stream with shapes that are selected
    */
   function selectE() {
       var sE = Draw.extractE('mousedown')
         .filterE(modeFilter)
         .mapE(function(m) {
           var shapes = Draw.getShapes()
           // Find out if a shape has been selected. From top layer to bottom.
           for(var i = shapes.length - 1; i >= 0; i--) {
               var possible = shapes[i];
               var x = m.layerX, y = m.layerY;
               if(possible.isOn(x,y)) {
                   shape = possible;
                   return { x:x, y:y };
               }
           }
           // if no shape was detected, report this
           return false;
         });
       // filter out all false selections
       return sE.filterE(function(e){return e});
   }
   
   /**
    * Initializes functionality for moving shapes.
    * @param
    */
   function initMove(sE) {

       // Are we moving an object or not. This boolean is used to distinguish
       // between a selection with immediate dragging (down+move+ ... +up) and
       // a selection by a click (down+up).
       var moving = false;
       
       // The coordinates of the shape's selection point and current position.
       var startX = 0, startY = 0,
           prevX = 0, prevY = 0;
       
       // An event stream of moving copy's of the shape we select
       var moveEe = sE.mapE(function(xy) {
           // when a selection is made, we assume we could be moving
           moving = true;
           
           //TODO: "disable" the real shape while working on a copy
           
           // work on a copy of the shape
           var copy = shape.copy();
           
           // initialize previous and start
           prevX = xy.x, prevY = xy.y;
           startX = prevX, startY = prevY;
           
           // return extract streams for a mousemove
           return Draw.extractE('mousemove')
                // filter out mode and events without a selection
                .filterE(modeFilter)
                .filterE(shapeFilter)
                // only move the copy if we are moving
                .filterE(function(){return moving})
                .mapE(function(m) {
                    // Ask the copy to move the change in x and y values
                    copy.move(m.layerX - prevX, m.layerY - prevY);
                    // update the previous location
                    prevX = m.layerX, prevY = m.layerY;
                    // return the changed copy
                    return copy;
                });
       });
       
       // An event stream with the never-sending eventstream zeroE each
       // time a shape is actually moved.
       var dropEe = Draw.globalExtractE('mouseup')
            // filter out mode and events without a selection
            .filterE(modeFilter)
            .filterE(shapeFilter)
            // only move the selected shape if we are moving
            .filterE(function(){return moving})
            // only perform this when we are moving a shape
            .mapE(function(/*mu*/) {
                // stop moving, causing subsequent mousemove and mouseup events
                // not to be handled by the move component.
                moving = false;
                
                // Calculate the needed increase and decrease in x,y based on
                // the last known moving location rather than mu's layerX and Y.
                var xInc = prevX - startX,
                    yInc = prevY - startY;
                // only change shapes when there was an actual move.
                if(xInc != 0 && yInc != 0) {                    
                    shape.move(xInc,yInc);
                    Draw.updateShape(shape);
                }
                // return zeroE to block the mousemove stream
                return zeroE();
            });
       
       var moveE = switchE(mergeE(moveEe,dropEe));
       
       // Draw the moving shape temporary
       moveE.mapE(function(shape) { Draw.drawTmpShape(shape); });
   }
   
   /**
    * Initialize functionality to change shapes
    */
   function initEdit(sE) {
       
       // Enable the properties related to a selected shape
       sE.mapE(function(/*xy*/){
           Draw.enableProperties(shape.tool.properties);
           Draw.setSize(shape.size);
           Draw.setColor(shape.color);
           Draw.setFill(shape.fill);
       });
       
       // Create a property change event stream carrying the updated shape when
       // a change in property occurs.
       function propChangeE(prop,sourceB) {
           return sourceB
             .changes()
             .filterE(shapeFilter)
             .mapE(function(propVal){
                shape[prop] = propVal;
                return shape;
           });
       }
       
       // merge all possible property change event streams
       var propE = mergeE(
         propChangeE('size',Draw.sizeB),
         propChangeE('fill',Draw.fillB),
         propChangeE('color',Draw.colorB)
       );
       
       // Draw when shape change events occur
       propE.mapE(function(shape) {
          Draw.updateShape(shape); 
       });
   }
   
   /**
    * Initialize functionality to change shapes
    */
   function initDelete(/*sE*/) {
       
       // Capture delete keydown's when a shape is selected
       // www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
       var deleteE = Draw.globalExtractE('keydown')
          .filterE(modeFilter)
          .filterE(shapeFilter)
          .filterE(function(kp){return kp.keyCode === 46});
          
       // Ask Draw to delete the selected shape
       deleteE.mapE(function(){
           console.log('removing');
           Draw.removeShape(shape);
           // The shape is removed and thus no longer selected
           shape = false;
       });
   }
   
   /**
    * Initialize functionality to change the shapes' order
    */
   function initReorder(/*sE*/) {
       var moveUpE = Draw.globalExtractE('keyup')
         .filterE(modeFilter)
         .filterE(shapeFilter)
         // check that up arrow is pressed
         .filterE(function(kp) { return kp.keyCode === 38 })
         // and the shift key is held
         .filterE(function(kp) { return kp.shiftKey })
       moveUpE.mapE(function() { Draw.moveUpShape(shape); });
       
       var moveDownE = Draw.globalExtractE('keyup')
         .filterE(modeFilter)
         .filterE(shapeFilter)
         // check that down arrow is pressed
         .filterE(function(kp) { return kp.keyCode === 40 })
         // and the shift key is held
         .filterE(function(kp) { return kp.shiftKey })
       moveDownE.mapE(function() { Draw.moveDownShape(shape); });
   }
   
   
   var my = {
       properties : [],
       help: 'Click on a shape to select it. Press delete to remove it and '+
             'drag to move it. Hold shift and up/down to reorder.'
   }
   
   my.init = function() {
       
       // Capture element selection events
       var sE = selectE();
       //sE.mapE(function(s){console.log(s.shape)}); //DEBUG
       
       // Initialize the subcomponents of the selection tool
       initMove(sE);
       initEdit(sE);
       initDelete(sE);
       initReorder(sE);      
       
   }
   
   my.deactivate = function() {
       // No shape is selected anymore
       shape = false;
   }
   
   return my;
})();