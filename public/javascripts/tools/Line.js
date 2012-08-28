/**
 * Tool -- Line
 * 
 * Allows us to draw a single straight line with custom size and color.
 * 
 * Shape: LineShape
 * 
 * @see tools/Template.js
 * @author Ben Corne
 */

function LineShape(x1,y1,x2,y2,size,color) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.size = size;
    this.color = color;
}

LineShape.create = function(x1,y1,x2,y2) {
    return new LineShape(x1,y1,x2,y2,Draw.getSize(),Draw.getColor());
}

LineShape.prototype.draw = function(ctx) {
    
    // see Rectangle.js
    var fix = (this.size % 2 == 0) ? 0 : 0.5;
    
    // Assign the properties
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(this.x1+fix,this.y1+fix);
    ctx.lineTo(this.x2+fix,this.y2+fix);
    ctx.stroke();
    ctx.closePath();
}

LineShape.prototype.isOn = function(x,y) {
    // We can't use ctx.isPointInPath since it's not a closed path.
    // We determine if a point R = (rx, ry) lies on the line connecting
    // points P = (px, py) and Q = (qx, qy) by checking if the determinant of
    // the matrix {{qx - px, qy - py}, {rx - px, ry - py}} is sufficiently close
    // to 0. This is avoids /0 checks. In our case:
    // | x2 - x1     y2 - y1  |
    // | x  - x1     y  - y1  |  = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
    var det = (this.x2 - this.x1) * (y - this.y1) -
              (this.y2 - this.y1) * (x - this.x1);
    return det < 100 && det > -100;
}

LineShape.prototype.copy = function() {
    return new LineShape(this.x1,this.y1,this.x2,this.y2,this.size,this.color);
}

LineShape.prototype.move = function(xIncrease,yIncrease) {
    this.x1 += xIncrease;
    this.x2 += xIncrease;
    this.y1 += yIncrease;
    this.y2 += yIncrease;
}

Draw.tools.Line = (function() {
    
    /**
     * Create a stream of temporary line shapes. Add a LineShape upon
     * finalization.
     */
    function lineDrawE() {
        
        var x1,y1;
        var drawing = false;
        var lineFilter = Draw.modeFilter('Line');
        
        var moveEe = Draw.extractE('mousedown')
            // filter out events that are not triggered during Line mode
            .filterE(lineFilter)
            .mapE(function(md) {
                
                // assign new starting coordinates
                x1 = md.layerX;
                y1 = md.layerY;
                // indicate we are drawing
                drawing = true;
                
                // create mousemove location event streams for each mousedown
                return Draw.extractE('mousemove')
                  .filterE(lineFilter)
                  // return the line's current location
                  .mapE(function(mm){
                      return new LineShape(
                        x1,y1,mm.layerX,mm.layerY,
                        Draw.getSize(), Draw.getColor());
                  });
            });
        
        var finishEe = mergeE(
                // finish when the mouse goes up or out
                Draw.extractE('mouseup'),Draw.extractE('mouseout'))
            .filterE(lineFilter)
            // don't respond to mouseup when we are not drawing
            // (mousedown hasn't been triggered)
            .filterE(function(){ return drawing})
            .mapE(function(mu) {
               drawing = false;
               Draw.addShape(new LineShape(
                    x1,y1,mu.layerX,mu.layerY,
                    Draw.getSize(), Draw.getColor()));
               // return the event stream that will never send an event
               return zeroE(); 
            });
        
        // return the moving event stream and the line event stream
        return switchE(mergeE(moveEe,finishEe));
    }
    
    var my = {
        // init() -- initialize
        properties : ['size','color'],
        shape: LineShape,
        help: 'Click and hold then move to the desired end point and release.'
    }
    
    my.init = function() {
        var drawE = lineDrawE();
        
        drawE.mapE(function(line){
            Draw.drawTmpShape(line);
        });
    }
    
    return my;
    
})();