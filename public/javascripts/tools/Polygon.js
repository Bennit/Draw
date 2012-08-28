/**
 * Tool -- Polygon
 * 
 * Allows us to draw a polygon with an arbitrary amount of corners and a custom
 * line size, line color and filling.
 *  
 * @depends Dot.js It uses DotShape for temporary representation.
 * @see tools/Template.js
 * @author Ben Corne
 */

function PolygonShape(corners,size,color,fill) {
    this.corners = corners;
    this.size = size;
    this.color = color;
    this.fill = fill;
}

PolygonShape.create = function(corners) {
    return new PolygonShape(corners,
        Draw.getSize(),Draw.getColor(),Draw.getFill());
}

PolygonShape.prototype.draw = function(ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.fillStyle = this.fill;
    
    ctx.beginPath();
    var point = this.corners[0];
    // plot lines from each corner to the next
    ctx.moveTo(point.x,point.y);
    for(var i = 1; i < this.corners.length; i++) {
        point = this.corners[i];
        ctx.lineTo(point.x,point.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

PolygonShape.prototype.isOn = function(x,y) {
    // plot the polygon on the auxilliary context
    var ctx = Draw.aux;
    ctx.beginPath();
    ctx.moveTo(this.corners[0].x,this.corners[0].y);
    for(var i = 1; i < this.corners.length; i++) {
        ctx.lineTo(this.corners[i].x,this.corners[i].y);
    }
    return ctx.isPointInPath(x,y);
}

PolygonShape.prototype.copy = function() {
    // a deep copy of points, as it is a non-trivial value
    var corners = new Array(this.corners.length);
    for(var i = 0; i < this.corners.length; i++)
        corners[i] = {x:this.corners[i].x,y:this.corners[i].y};
    return new PolygonShape(
        corners,
        this.size,
        this.color,
        this.fill
    );
}

PolygonShape.prototype.move = function(xInc,yInc) {
    // move a polygon = move all the corners
    for(var i = 0; i < this.corners.length; i++) {
        this.corners[i].x += xInc;
        this.corners[i].y += yInc;
    }
}

Draw.tools.Polygon = (function() {
    
    /**
     * Create a temporary polygon-creation shape stream. This will consist of
     * DotShapes since it would be confusing to the user to see the polygon up
     * to now.
     * 
     * Captures shape-finishing events and makes a call to Draw.addShape(shape).
     */
    function polygonDrawE() {
        
        var points;
        var drawing = false;
        var corner;
        var modeFilter = Draw.modeFilter('Polygon');
        var drawFilter = function() { return drawing; };
        
        var moveEe = Draw.extractE('mousedown')
            .filterE(modeFilter)
            .mapE(function(md) {
               drawing = true;
               // The last known temporary corner.
               corner = md;
               points = [{x:md.layerX,y:md.layerY}];
               // merge mouse move events and keypress->mouse move/down events
               return mergeE(
                 Draw.extractE('mousemove').filterE(modeFilter),
                 Draw.globalExtractE('keypress').filterE(modeFilter)
                     // filter out enter keypresses
                    .filterE(function(kp){return kp.keyCode == 13})
                    .mapE(function() {
                        // permanently add a polygon corner
                        points.push({x:corner.layerX,y:corner.layerY});
                        // return the mouse event for temporary drawing
                        return corner;
                    }))
                 // on both mousemove and mouseup, return a DotShape that
                 // represents all the edges of the polygon up to now.
                 .mapE(function(m) {
                    // update last known temporary corner
                    corner = m;
                    return DotShape.create(points.concat({x:m.layerX,y:m.layerY}));
                 });
            });
            
        var finishEe = Draw.extractE('mouseup').filterE(modeFilter)
            .mapE(function(mu) {
               // finilize the points array
               points.push({x:mu.layerX,y:mu.layerY});
               var polygon = PolygonShape.create(points);
               // draw a temporary version of the finalized polygon
               Draw.drawTmpShape(polygon);
               // and add the finalized polygon
               Draw.addShape(polygon);
               // reset the points array (see Dot.js)
               points = [];
               return zeroE();
            });
        
        return switchE(mergeE(moveEe,finishEe));
    }

    var my = {
        properties: ['size','color','fill'],
        shape: PolygonShape,
        help: 'Click and hold then drag to the desired corner and press enter '+
              'to confirm the corner. Release to complete the polygon.'
    };

    my.init = function() {
        var drawE = polygonDrawE();
        
        drawE.mapE(function(dot) {
            Draw.drawTmpShape(dot);
        });
    }
    
    return my;
    
})();