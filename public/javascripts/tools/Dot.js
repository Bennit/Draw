/**
 * Tool -- Dot
 * 
 * Allows us to draw a smooth line with custom size and color.
 * 
 * Shape: DotShape(points,size,color)
 * 
 * @see tools/Template.js
 * @author Ben Corne
 */

function DotShape(points,size,color) {
    this.points = points; // Sequence of points
    this.size = size;
    this.color = color;
}

DotShape.create = function(points) {
    return new DotShape(points,Draw.getSize(),Draw.getColor());
}

DotShape.prototype.draw = function(ctx) {
    
    // Rectangle fix is too simple for dots, it makes gaps appear when
    // the curve is too steep, a check should occur to add the fix depending
    // how steep the rico is between lines
    
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for(var i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x,this.points[i].y);
    }
    ctx.stroke();
    ctx.closePath();
}

DotShape.prototype.isOn = function(x,y) {
    var ctx = Draw.aux;
    ctx.lineWidth = this.size;
    
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for(var i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x,this.points[i].y);
    }
    return ctx.isPointInPath(x,y);
}

DotShape.prototype.copy = function() {
    // a deep copy of points, as it is a non-trivial value
    var points = new Array(this.points.length);
    for(var i = 0; i < this.points.length; i++)
        points[i] = {x:this.points[i].x,y:this.points[i].y};
    return new DotShape(
        points,
        this.size,
        this.color
    );
}

DotShape.prototype.move = function(xInc,yInc) {
    for(var i = 0; i < this.points.length; i++) {
        this.points[i].x += xInc;
        this.points[i].y += yInc;
    }
}

Draw.tools.Dot = (function() {
    
    function dotDrawE() {
        
        var modeFilter = Draw.modeFilter('Dot');
        var drawing = false;
        var drawFilter = function() {return drawing};
        var points;
        
        // start drawing a dot when the mouse is held down
        var moveEe = Draw.extractE('mousedown')
          .filterE(modeFilter)
          .mapE(function(md){
              drawing = true;
              points = [{x:md.layerX,y:md.layerY}];
              // map over the move, enter and leave event streams
              return mergeE(Draw.extractE('mousemove'),
                            Draw.extractE('mouseenter'),
                            Draw.extractE('mouseleave'))
                .filterE(modeFilter)
                .filterE(drawFilter)
                .mapE(function(m){
                  // add each detected point to the sequence
                  points.push({x:m.layerX,y:m.layerY});
                  // return a temporary DotShape object to be drawn
                  return DotShape.create(points);
              });
          });

        // finish drawing a dot when the mouse goes up
        var finishEe = Draw.globalExtractE('mouseup')
            .filterE(modeFilter)
            .filterE(drawFilter)
            .mapE(function(/*mu*/) {
               drawing = false;
               Draw.addShape(DotShape.create(points));
               // Probably due to multithreadding, the mousemove event stream
               // fires off some more events right before zeroE is returned,
               // jamming further mousemove mappings, thus adding more points to
               // the points array. Therefore we put a placeholder to avoid
               // no such method '.push()' errors, or pushing after it has been
               // finalized.
               points = [];
               return zeroE();
            });
        
        return switchE(mergeE(moveEe,finishEe));
    }
    
    var my = {
        // Properties associated to a DotShape
        properties: ['size','color'],
        shape: DotShape,
        help: 'Click and hold to start drawing. Release to finish the shape.'
    }
    
    my.init = function() {
        var drawE = dotDrawE();
        drawE.mapE(function(dot){ Draw.drawTmpShape(dot) });
    }
    
    return my;
    
})();