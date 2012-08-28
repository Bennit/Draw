/**
 * Tool -- Rectangle
 * 
 * Allows us to draw an arbitrary large rectangle with custom line size, line
 * color and filling.
 * 
 * @see tools/Template.js
 * @author Ben Corne
 */

function RectangleShape(x,y,w,h,size,color,fill) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = size;
    this.color = color;
    this.fill = fill;
}

/**
 * Factory for Rectangle creation from coordinates.
 * Uses Draw's current values for size, color and fill.
 */
RectangleShape.create = function(x1,y1,x2,y2) {
    return new RectangleShape(
        Math.min(x1,x2) + 0.5,  // x
        Math.min(y1,y2) + 0.5,  // y
        Math.abs(x1 - x2),      // w
        Math.abs(y1 - y2),      // h
        Draw.getSize(),         // size
        Draw.getColor(),        // color
        Draw.getFill()          // fill
    );
}

RectangleShape.prototype.draw = function(ctx) {
    // add 0.5 if linewidth is even to fix the 'half pixel issue'
    // stackoverflow.com/questions/6886791/is-this-a-canvass-linewidth-bug
    var fix = (this.size % 2 == 0) ? 0.5 : 0;
    
    // Fill the rectangle
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x+fix,this.y+fix,this.w,this.h);
    
    // Then draw the border
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.strokeRect(this.x+fix,this.y+fix,this.w,this.h);
}

RectangleShape.prototype.isOn = function(x,y) {
    return x >= this.x && x <= this.x+this.w &&
           y >= this.y && y <= this.y+this.h;
}

RectangleShape.prototype.copy = function() {
    return new RectangleShape(
        this.x,this.y,
        this.w,this.h,
        this.size, this.color, this.fill
    );
}

RectangleShape.prototype.move = function(xIncrease,yIncrease) {
    this.x += xIncrease;
    this.y += yIncrease;
}

Draw.tools.Rectangle = (function() {
    
    // temporary rectangle stream
    function rectangleDrawE() {
        
        var x,y;
        var drawing = false;
        var rectFilter = Draw.modeFilter('Rectangle');
        
        var moveEe = Draw.extractE('mousedown')
            // filter out events that are not triggered during Line mode
            .filterE(rectFilter)
            .mapE(function(md) {
                // assign new starting coordinates
                x = md.layerX;
                y = md.layerY;
                // indicate we are drawing
                drawing = true;
                
                // create mousemove location event streams for each mousedown
                return mergeE(Draw.extractE('mousemove'),
                              Draw.extractE('mouseenter'),
                              Draw.extractE('mouseleave'))
                  .filterE(rectFilter)
                  // return the line's current location
                  .mapE(function(m){
                      return RectangleShape.create(x,y,m.layerX,m.layerY);
                  });
            });
        
        var finishEe = Draw.globalExtractE('mouseup')
            .filterE(rectFilter)
            // don't respond to mouseup when we are not drawing
            // (mousedown hasn't been triggered)
            .filterE(function(){ return drawing})
            .mapE(function(mu) {
               drawing = false;
               Draw.addShape(RectangleShape.create(x,y,mu.layerX,mu.layerY));
               // return the event stream that will never send an event
               // to avoid moveEe to send more event streams
               return zeroE(); 
            });
        
        // return the moving event stream and the line event stream
        return switchE(mergeE(moveEe,finishEe));
    }
    
    var my = {
        properties : ['size','color','fill'],
        shape: RectangleShape,
        help: 'Click and hold then drag to the desired point and release.'
    };
    
    my.init = function() {
        var drawE = rectangleDrawE();
        
        drawE.mapE(function(rect){
            Draw.drawTmpShape(rect);
        });
    }
    
    return my;
    
})();