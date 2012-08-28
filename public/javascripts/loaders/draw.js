/**
 * DRAWING MODULE
 * 
 * This module handles drawing in the draw view.
 * 
 * // STATE
 * tools                -- Mode -> Tool mappings. Tools add themselves to this.
 * 
 * shapesB              -- behaviour carrying the current shapes array
 * 
 * modeB                -- The active drawing mode
 * 
 * sizeB                -- The marker size [ getSize(), setSize(size) ]
 * colorB               -- The marker color [ getColor() , setColor(color) ]
 * fillB                -- The shape fill color [ getFill(), setFill(color) ]
 * 
 * canvas               -- The only visible canvas
 * aux                  -- invisble auxilliary canvas' context
 * shapesCanvas         -- Auxilliary canvas used to draw shape arrays on
 * tmp                  -- Temporary canvas, used to show in-between results
 *                         during the flow of a mode
 * 
 * // FUNCTIONALITY
 * modeFilter(mode)     -- Create a stream filter for events on the given mode.
 * extractE(evt)        -- Extract the given event from the visible canvas
 * globalExtractE(evt)  -- Extract the given event from the entire page
 * drawTmpShape(shape)  -- Draw and visualize the given shape temporary
 * 
 * addShape(shape)      -- Add a given shape to the drawing
 * removeShape(shape)   -- Remove the given shape from the drawing
 * updateShape(shape)   -- Update the properties of the given shape
 * moveDownShape(shape) -- Move the given shape down one layer
 * moveUpShape(shape)   -- Move the given shape up one layer
 * 
 * init(w,h,shapes)     -- Initialize the drawing module with the given width,
 *                         height and shapes-string. This is to be called after
 *                         all tools have been loaded.
 *                         
 * // NOW.JS
 * now.updateShapes(shapes) -- trigger shape update given a plain shape list
 * 
 * For a detailed look of the expected and optional API of a tool, look at
 * tools/Template.js
 * 
 * Two convenience methods have been added to HTMLCanvasElement's prototype:
 *   - clear()                 -- This clears the entire canvas
 *   - copyCanvas(otherCanvas) -- This copies data over from otherCanvas
 * 
 * @author Ben Corne
 */
var Draw = (function() {
    
    /**
     * Create a new drawing canvas, which is appended to the given parent.
     * @param width The width of the canvas
     * @param height The height of the canvas
     */
    function createCanvas(width,height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.ctx = canvas.getContext('2d');
        return canvas;    
    }

    // Add a clear canvas method
    HTMLCanvasElement.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Add a method to copy over one canvas to the other
    HTMLCanvasElement.prototype.copyCanvas = function(canvas) {
        this.ctx.drawImage(canvas,0,0);    
    }
    
    // PUBLIC INTERFACE
    var my = {tools:{}};
    
    // TOOL DEFAULTS
    var defaults = {
      activate:function(){},
      deactivate:function(){},
      properties:[],
      shape:false,
      help:''
    };  
    
    // PROPERTY DEFAULTS
    var defaultMode = 'Selection',
        defaultSize = '1',
        defaultColor = 'black',
        defaultFill = 'transparent';
    
    // STATE
    var shapesB,
    
        modeB,
    
        sizeE = receiverE(), // interface to change sizeB programmatically
        sizeB,
        
        colorE = receiverE(), // interface to change colorB programmatically
        colorB,
        
        fillE = receiverE(), // interface to change fillB programmatically
        fillB;
        
    // -----------------------------------------------------
    // ----               INITIALIZERS                   ---
    // -----------------------------------------------------
    
    // Initialization of the graphics part (canvases)
    function initTable(width,height) {
        // initialize the drawing table
        var table = $('table');
        
        // apply style to the table containing canvases
        jQuery(table).css('width',width).css('height',height).center().show();
        
        // add the temporary shape drawing canvas
        my.tmp             = createCanvas(width,height);
        
        // and the buffer for drawing all shapes
        my.shapesCanvas    = createCanvas(width,height);
        
        // add the shapes canvas, this should always be last since it's used to
        // capture events
        my.canvas          = createCanvas(width,height);
        
        // create an auxilliary context used by Shape.isOn etc.
        my.aux             = createCanvas(width,height).ctx;
        
        table.appendChild(my.canvas);
        
        // Disable text selection behaviour
        document.onselectstart = function() {return false;};
    }
    
    // Initialization of the toolshed, all tools should be loaded first
    function initTools() {
        // initialize all loaded tools
        for(var t in my.tools) {            
            var tool = my.tools[t];
            
            // Initialize the optional slots in the tool if not available
            for(var slot in defaults)
                if(! (slot in tool))
                    tool[slot] = defaults[slot];
            
            // Initialize the tool's shape if defined
            if(tool.shape) {
                // create a back link to the tool
                tool.shape.prototype.tool = tool;
            }

            // Tell the tool to finish the intialization
            tool.init();
            
            // Create a new button for this tool
            var toolDOM = document.createElement('div');
            toolDOM.style.backgroundImage =
                'url(/images/draw/'+t.toLowerCase()+'.png)';
            toolDOM.title = t;
            toolDOM.className = 'panel-item button';
            if(t == defaultMode) {
                toolDOM.className += ' active';
                jQuery('#tooltip').html(my.tools[t].help);
            }
            $('tools').appendChild(toolDOM);
        }
    }
    
    // Initialization of the mode-switching functionality
    function initMode() {
        
        // Activate the given tool
        function activate(toolName) {
            var tool = my.tools[toolName];

            // Notify the previous tool it was deactivated
            my.tools[my.getMode()].deactivate();

            // Show the tooltip for this tool
            jQuery('#tooltip').html(tool.help);

            // Enable the appropriate properties
            my.enableProperties(tool.properties);

            // Notify the just activated tool it was activated
            tool.activate();
        }
        
        // link tool clicks to changes of mode
        modeB = jQuery('div.panel-sub > div > div')
            // Capture clicks on brushes
            .fj('extEvtE','click')
            .mapE(function(click){
                // Notify the user the brush has changed
                jQuery('div.panel-sub > div > div').removeClass('active');
                jQuery(click.target).addClass('active');
                
                // Update the active tool in the draw module
                activate(click.target.title);
                
                // Return the name of the currently active tool
                return click.target.title;
            })                
            // Make a behaviour of changing brushes
            .startsWith(defaultMode);
        
        // activate the default mode
        activate(defaultMode);
    }
    
    // Initialization of the properties-panel and behaviours
    function initProperties() {
        // initialize the property behaviours
        jQuery('#size').val(defaultSize);
        sizeB = changeB(sizeE,'size');
        insertValueB(liftB(function(size){return size+'px'},sizeB),
            'size-example','style','height');
            
        jQuery('#color').val(defaultColor);
        colorB = changeB(colorE,'color');
        insertValueB(colorB,'color-example','style','backgroundColor');
        
        jQuery('#fill').val(defaultFill);
        fillB = changeB(fillE,'fill');
        insertValueB(fillB,'fill-example','style','backgroundColor');
        
        my.sizeB = sizeB;
        my.colorB = colorB;
        my.fillB = fillB;
    }
    
    // Initialization of the top-bar actions (leave,save,export,clear)
    function initActions() {
        
        // Clicks on the action button
        clicksE('action-leave').mapE(function(){
            now.leaveDraw();
            jQuery('#draw').remove();
            jQuery('#lobby').show();
        });
        
        // Clicks on the save button (only for registered users)
        if(!guest) {
            var saveNameB = $B('save-name');
            clicksE('action-save').snapshotE(saveNameB).mapE(function(name){
                now.saveDraw(name);});
            var saveTimeB = nowfx.receiveE('saveDrawOk').mapE(function(){
                return 'Last saved: '+(new Date()).format("yy/mm/dd hh:MM:ss");
            }).startsWith('');
            insertDomB(SPAN(saveTimeB),'last-save');
        }
        
        // Clicks on the clear button
        clicksE('action-clear').mapE(function(){
            var shapes = my.getShapes();
            for(var i in shapes) {
                // remove each shape one by one
                // TODO: implement clear serverside to remove all at once
                my.removeShape(shapes[i]);
            }
        });
        
        // Clicks on the action-export button
        var download = document.createElement('a');
        download.download = 'drawing.png';        
        clicksE('action-export').mapE(function() {
            download.href = Draw.canvas.toDataURL();
            download.click();
        });
        
    }
    
    /**
     * now.updateShapes(shapes)
     * 
     * Replace the shapes in the drawing with the given ones and redraw them.
     * The initial shapes are plain objects and are converted to real shapes by
     * the intializer.
     * 
     * This intializer is to be called last.
     */
    function initShapes(plainShapes) {
         // Draw the shapes array. This also draws the temporary buffer.
         function redraw(shapes) {
            // clear the shapes buffer
            my.shapesCanvas.clear();
            for(var idx = 0; idx < shapes.length; idx++) {
                // draw each shape on the shapes buffer
                shapes[idx].draw(my.shapesCanvas.ctx);
            }
            // copy the temporary buffer in the shapes buffer
            my.shapesCanvas.copyCanvas(my.tmp);
            // clear the real canvas
            my.canvas.clear();
            // copy the shapes buffer to the real canvas
            my.canvas.copyCanvas(my.shapesCanvas);
        }
        
        // Add the correct shape behaviour to each plain shape object.
        function shapeify(shapes) {
            // Cast all shapes by setting their proto object.
            for(var idx in shapes) {
                var shape = shapes[idx];
                // Retrieve the prototype of the shape's constructor / type
                shape.__proto__ = window[shape.type].prototype;
                // ECMA 4 does not allow this, however efficient-wise it's much
                // faster than recreating each shape into it's proper object.
            }
            return shapes;
        }
        
        // Receive lists of plain shapes and transform them in real shapes
        var shapesE = nowfx.receiveE('updateShapes','shapes')
            // Extract the shapes array outof the request
            .mapE(function(r){return r.shapes})
            // Cast all the shapes correctly
            .mapE(shapeify);
            
        // intialize the behaviour
        shapesB = shapesE.startsWith(shapeify(plainShapes));
        // map the draw method over it
        shapesB.changes().mapE(redraw);
        // perform the initial draw
        redraw(plainShapes);
    }
    
    // -----------------------------------------------------
    // ----                 PUBLIC API                   ---
    // -----------------------------------------------------
    
    // get the mode we are on
    my.getMode = function(){ return modeB.valueNow() }
    
    // get the current shapes array
    my.getShapes = function() { return shapesB.valueNow() }
    
    // getters and setters for properties
    my.getSize = function(){ return sizeB.valueNow() }
    my.setSize = function(size) { sizeE.sendEvent(size) }
    
    my.getFill = function(){ return fillB.valueNow() }
    my.setFill = function(fill) { fillE.sendEvent(fill) }
    
    my.getColor = function(){ return colorB.valueNow() }
    my.setColor = function(color) { colorE.sendEvent(color) }
    
    /**
     * Enable all the given properties and disable the rest
     */
    my.enableProperties = function(properties) {
        // hide the property box if no properties were given or show otherwise
        if(properties.length == 0)
            jQuery('#properties').parent().hide();
        else
            jQuery('#properties').parent().show();
        // hide all properties
        jQuery('#properties tr').hide();
        // show those that are given
        for(var i in properties) {
            jQuery('#'+properties[i]).parent().parent().show();
        }
    }
    
    // Draw a temporary shape, clearing the previous temporary shape
    my.drawTmpShape = function(shape) {
        // Clear the temporary shape canvas
        my.tmp.clear();
        // Copy the existing shapes in it
        my.tmp.copyCanvas(my.shapesCanvas);
        // Draw the temporary shape in it
        shape.draw(my.tmp.ctx);
        // Copy the buffer to the visible canvas
        my.canvas.clear();
        my.canvas.copyCanvas(my.tmp);
    }
    
    my.extractE = function(event) {
        return extractEventE(my.canvas,event);
    }
    
    my.globalExtractE = function(event) {
        return extractEventE(document,event);
    }
    
    my.modeFilter = function(mode) {
        return function(){return modeB.valueNow() == mode };
    }
    
    /**
     * Request shape addition
     */
    my.addShape = function(shape) {
        // make sure the shape knows which type it is, as it looses it's
        // prototypical behaviour when it gets passed as arguments through
        // now.js (http://jsfiddle.net/Bennit/ZceTs/)
        shape.type = shape.constructor.name;
        my.tmp.clear(); // done performing an action, clear tmp
        now.addShape(shape);
        
    }
    
    /**
     * Request shape removal
     */
    my.removeShape = function(shape) {
        my.tmp.clear(); // done performing an action, clear tmp
        now.removeShape(shape.id);
    }
    
    /**
     * Request replacement of the server's shape with this shape's id
     * with this shape.
     */
    my.updateShape = function(shape) {
        my.tmp.clear(); // done performing an action, clear tmp
        now.updateShape(shape);
    }
    
    /**
     * Request shape reordering downwards
     */
    my.moveDownShape = function(shape) {
        my.tmp.clear(); // done performing an action, clear tmp
        now.moveDownShape(shape.id);
    }
    
    /**
     * Request shape reordering upwards
     */
    my.moveUpShape = function(shape) {
        my.tmp.clear(); // done performing an action, clear tmp
        now.moveUpShape(shape.id);
    }    
    
    /**
     * Initialize the drawing window. This means initializing all event streams,
     * property behaviours and event stream mappers for actions. It also
     * initializes each individual tool.
     * 
     * This method must be called after all tools have been loaded.
     * 
     * @param width The width of the drawing table (pixels)
     * @param height The height of the drawing table (pixels)
     * @param shapes A JSON string containing all shapes in the drawing.
     */
    my.init = function(width,height,shapes) {
        // initialize the nescessary drawing canvases
        initTable(width,height);
        // initialize the properties-input field behaviours
        initProperties();
        // initialize the toolshed
        initTools();
        // initialize mode-switching functionality
        initMode();
        // initialize the top-bar actions
        initActions();
        // initialize the shapes
        initShapes(JSON.parse(shapes));
    };
    
    // return the public interface
    return my;
    
}());