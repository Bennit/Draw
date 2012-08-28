/**
 * Tool -- Ellipse
 * 
 * Allows us to draw an arbitrary wide and high ellipse with custom line size,
 * line color and filling.
 * 
 * @see tools/Template.js
 * @author Ben Corne
 */

function EllipseShape(w,h,x,y,size,color,fill) {
    
    this.w = w; // horizontal radius
    this.h = h; // vertical radius
    this.x = x; // center's X coordinate
    this.y = y; // center's Y coordinate
    
    this.size = size;
    this.color = color;
    this.fill = fill;
}

EllipseShape.create = function(x1,y1,x2,y2) {
    var w = Math.abs(x1 - x2);
    var h = Math.abs(y1 - y2);
    return new EllipseShape(
       w,
       h,
       Math.min(x1,x2) + Math.floor(w / 2),
       Math.min(y1,y2) + Math.floor(h / 2),
       Draw.getSize(),
       Draw.getColor(),
       Draw.getFill()
    );
}

EllipseShape.prototype.copy = function() {
    return new EllipseShape(
        this.w,this.h,this.x,this.y,
        this.size,this.color,this.fill
    );
}

EllipseShape.prototype.draw = function(ctx) {
    // http://www.williammalone.com/briefs/how-to-draw-ellipse-html5-canvas/
    
    ctx.beginPath();
  
    // starting point
    ctx.moveTo(this.x, this.y - this.h/2); // A1
  
    // left side of the ellipse
    ctx.bezierCurveTo(
        this.x + this.w/2, this.y - this.h/2, // Control point 1
        this.x + this.w/2, this.y + this.h/2, // Control point 2
        this.x, this.y + this.h/2); // ending point

    // right side of the ellipse
    ctx.bezierCurveTo(
        this.x - this.w/2, this.y + this.h/2, // Control point 1
        this.x - this.w/2, this.y - this.h/2, // Control point 2
        this.x, this.y - this.h/2); // ending point
 
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.stroke();
    
    ctx.fillStyle = this.fill;
    ctx.fill();
    
    ctx.closePath();
    
}

EllipseShape.prototype.isOn = function(x,y) {
    // @see EllipseShape.prototype.draw
    var ctx = Draw.aux;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.h/2);
    ctx.bezierCurveTo(
        this.x + this.w/2, this.y - this.h/2,
        this.x + this.w/2, this.y + this.h/2,
        this.x, this.y + this.h/2);
    ctx.bezierCurveTo(
        this.x - this.w/2, this.y + this.h/2,
        this.x - this.w/2, this.y - this.h/2,
        this.x, this.y - this.h/2);
    return ctx.isPointInPath(x,y);
}

EllipseShape.prototype.move = function(xInc,yInc) {
    this.x += xInc;
    this.y += yInc;
}

Draw.tools.Ellipse = (function() {
    
    function ellipseDrawE() {
        
        var x,y; // starting coordinates of the surrounding rectangle
        var modeFilter = Draw.modeFilter('Ellipse');
        var drawing = false;
        var drawFilter = function(){return drawing;}
        
        var moveEe = Draw.extractE('mousedown').filterE(modeFilter)
          .mapE(function(md){
              drawing = true;
              // update the surrounding rectangle's starting corner
              x = md.layerX;
              y = md.layerY;
              
              return Draw.extractE('mousemove').filterE(modeFilter)
                .filterE(drawFilter)
                .mapE(function(mm){
                  return EllipseShape.create(x,y,mm.layerX,mm.layerY,true);
                });
          });
        
        var finishEe =
            mergeE(Draw.extractE('mouseup'),Draw.extractE('mouseout'))
            .filterE(drawFilter)
            .filterE(modeFilter)
            .mapE(function(mu) {
               drawing = false;
               Draw.addShape(EllipseShape.create(x,y,mu.layerX,mu.layerY));
               return zeroE();
            });
        
       // Finishing events result in the never-firing zeroE() stream. This 
       // technique is also used in the dragging example on the flapjax site:
       // http://www.flapjax-lang.org/demos/index.html#drag
       return switchE(mergeE(moveEe,finishEe));
    }
    
    var my = {
        properties: ['size','color','fill'],
        shape: EllipseShape,
        help: 'Click and hold to shape the ellipse. Release to finish.'
        
    };
    
    my.init = function() {
        var drawE = ellipseDrawE();
        drawE.mapE(function(ellipse){ Draw.drawTmpShape(ellipse) });
    }
    
    return my;
    
})();