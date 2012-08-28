/**
 * Tool -- Template
 * 
 * An example drawing tool illustrating the interface and use of Draw's
 * tool hooks.
 * 
 * @author Ben Corne
 */

/**
 * The object representing the example shape. It should quack like this duck:
 * 
 * TemplateShape.create(...) -- Factory for creating new templates
 * 
 * template.draw(ctx)        -- Draw the shape on the given context
 * template.isOn(x,y)        -- Are the given coordinates a hit on the shape
 * template.copy()           -- Return a deep copy of the shape
 * template.move(xInc,yInc)  -- Move the shape xInc,yInc over the xy-axis
 */
function TemplateShape(prop1,prop2,prop3) {
    this.prop1 = this.prop1;
    this.prop2 = this.prop2;
    this.prop3 = this.prop3;
}

// Factory for creating a new TemplateShape
TemplateShape.create = function(/*arguments*/) {
    // Calculate TemplateShape's properties based on the arguments
    var prop1,prop2,prop3;
    // Return a new instance of the shape
    return new TemplateShape(prop1,prop2,prop3);
}

// Drawing this shape on a given 2D drawing context
TemplateShape.prototype.draw = function(ctx) {
    // set some brush settings
    ctx.strokeStyle = this.prop1;
    ctx.fillStyle = this.prop2;
    ctx.lineWidth = this.prop3;
    // plot the shape
    ctx.beginPath();
    // ctx.moveTo
    // ctx.lineTo
    // ctx.rect
    // ...
    ctx.closePath();
    
    // draw the plot
    ctx.fill();
    ctx.stroke();
}

// Return whether the given location lies within the shape or not
TemplateShape.prototype.isOn = function(x,y) {
    // We can make use of the auxilliary context to use it's isPointInPath()
    // method. Or we can just calculate if it hits the shape using our own
    // brain.
    Draw.aux.beginPath();
    // plot the shape
    // Draw.aux.moveTo(...)
    // Draw.aux.lineTo(...)
    return Draw.aux.isPointInPath(x,y);
}

// Create a deep copy of this shape, since we will work directly on the copy.
TemplateShape.prototype.copy = function() {
    return new TemplateShape(this.prop1,this.prop2.slice(0),this.prop3);
}

// Moving a TemplateShape, changing it's inner state
TemplateShape.prototype.move = function(xInc,yInc) {
    // Increase the shape's x and y coordinates with resp xInc and yInc.
    this.prop2.x += xInc;
    this.prop2.y += yInc;
}

/**
 * Draw.tools.Template -- Tool interface for Template mode
 */
Draw.tools.Template = (function() {
    
    function templateDrawE() {
        /**
         * Return an event stream that carries temporary shapes while
         * constructing the final TemplateShape.
         * 
         * Capture events that finish the shape creation and make a call
         * to Draw.addShape(shape).
         */
    }
    
    /**
     * The Template tool's interface.
     */
    var my = {

        // The properties visible when this tool is activated
        // -- Optional, defaults to []
        properties: ['size','color','fill'],
        
        // The shape function used to create shapes by this tool
        // -- Optional, defaults to false
        shape: TemplateShape,

        // A tooltip that tells how to create Example shapes using this tool.
        // -- Optional, defaults to ''
        help: 'Click and hold, then drag and release to finish the shape.',

        // init()       -- Called upon tool initialization
        // activate()   -- Called upon tool activation (optional)
        // deactivate() -- Called upon tool deactivation (optional)
        // These are callbacks to have a synchronous control flow, making sure
        // the user is not able to use the tool before these are handled.
        
    }

    /**
     * Initialize the temporary templateDrawing stream. This is only called each
     * time the tools are loaded.
     */
    function init() {
        var drawE = templateDrawE();
        
        drawE.mapE(function(dot) {
            Draw.drawTmpShape(dot);
        });
    }
    
    /**
     * Set some state when the tool is activated.
     */
    function activate() {
        
    }
    
    /**
     * Do some cleanup when the tool is deactivated.
     */
    function deactivate() {
        
    }
    
    // Return the tool's interface
    return my;
    
})();