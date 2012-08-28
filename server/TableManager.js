/**
 * Table MODEL
 * 
 * Implements storage and representation of active drawing tables.
 * 
 * @author Ben Corne
 */
GLOBAL.TableManager = (function(){
    
    var my = {};
    
    /** user management **/
    var tables = {};
    var tid = 0;
    
    /**
     * { 
     *   width: The width of this table,
     *   height: The height of this table,
     *   shapes: The shapes in this table,
     *   id: The unique identifier of this table,
     *   clients: A nowfx Group of all clients in this table,
     *   leftE: When a client has truely left this table,
     * }
     */
    function Table(name,width,height,shapes) {
        
        var table = this;
        this.name = name;
        this.width = width;
        this.height = height;
        this.shapes = shapes.slice(0);//work on a copy of shapes
        this.id = tid; // unique id
        
        this.shapeId = 0;
        
        // Group to communicate to all clients for this table
        this.clients = nowfx.getGroup('table_'+tid);
        this.now = this.clients.now;
        
        // static external content
        this.external = {name:name,width:width,height:height,id:tid};
        
        // add yourself to the table list
        tables[tid] = this;
        tid++; // make sure it's a unique identifier
        
        
        var getNickname = function(u){return u.user.nickname;}
        // Stream with events indicating a client left the table by either
        // a clean leave or due to a disconnect.
        this.leftE = this.clients.leftE.mapE(getNickname);
        // Stream indicating a user has joined the table.
        this.joinedE = this.clients.joinE.mapE(getNickname);
        
        this.leftE.mapE(function(nickname){
            //DEBUG table.now empty at this point
            //table.now.receiveDrawMessage(nickname+' left the table');
        });
        
        this.joinedE.mapE(function(nickname){
            //DEBUG table.now empty at this point
            //table.now.receiveDrawMessage(nickname+' joined the table');
        });
        
    }
    
    /**
     * Add a client to the table.
     * @param user A now.js#User object
     */
    Table.prototype.addClient = function(user) {
        user.user.joinTable(this);
        this.clients.addUser(user.clientId);
    };
    
    /**
     * Remove a client from the table. This is the 'clean leave' trigger
     * for Table.leftE events.
     * @param user A now.js#User object
     */
    Table.prototype.removeClient = function(user) {
        user.user.leaveTable();
        this.clients.removeUser(user.clientId);
    };
    
    /**
     * Retrieve all the nicknames in this table.
     * @returns An array of nicknames.
     **/
    Table.prototype.getUsers = function() {
        var users = new Array();
        for(var clientId in this.clients.users)
            users.push(this.clients.users[clientId].user);
        return users;
    };
    
    /**
     * Count all users
     * @returns The number of users in this table.
     */
    Table.prototype.countUsers = function() {
        return this.getUsers().length;
    };
    
    /**
     * The external version for this table.
     */
    Table.prototype.externalize = function() {
        this.external.userCount = this.countUsers()
        return this.external;
    };
    
    /**
     * Add a shape to the table. This will be a top-most layer.
     **/
    Table.prototype.addShape = function(shape) {
        // assign a unique id to the shape
        shape.id = this.shapeId++;
        // add it to back of the shape list (top most layer)
        this.shapes.push(shape);
    };
    
    /**
     * Find the index of a shape by id. Returns -1 if not found.
     **/
    Table.prototype.findShape = function(id) {
        for(var idx = 0; idx < this.shapes.length; idx++) {
            if(this.shapes[idx].id === id)
                return idx;
        }
        // not found.
        return -1;
    }
    
    /**
     * Remove the shape with the given id from the table.
     **/
    Table.prototype.removeShape = function(id) {
        var idx = this.findShape(id);
        if(idx >= 0)
            this.shapes.remove(idx);
    };
    
    /**
     * Update a shape in the table. This replaces a shape with the given one.
     */
    Table.prototype.updateShape = function(shape) {
        var idx = this.findShape(shape.id);
        if(idx >= 0)
            // update the shape reference
            this.shapes[idx] = shape;
    };

    /**
     * Move down a shape. This switches the shape with a shape under it.
     **/
    Table.prototype.moveDownShape = function(id) {
        var idx = this.findShape(id);
        // no find = moving down the first shape = do nothing
        if(idx > 0) {
            var tmp = this.shapes[idx];
            this.shapes[idx] = this.shapes[idx - 1];
            this.shapes[idx - 1] = tmp;
        }
    };
    
    /**
     * Move up a shape. This switches the shape with the shape above it.
     */
    Table.prototype.moveUpShape = function(id) {
        var idx = this.findShape(id);
        // no find = moving  up the last shape = do nothing
        if((idx >= 0) && (idx !== (this.shapes.length - 1))) {
            var tmp = this.shapes[idx];
            this.shapes[idx] = this.shapes[idx + 1];
            this.shapes[idx + 1] = tmp;
        }
    };    

    /**
     * Adds a new table to the system.
     * @returns the freshly added table.
     */
    my.addTable = function(name,width,height,shapes) {
        var table = new Table(name,width,height,shapes);
        
        // After each left, delete the table if the table is empty
        table.leftE.mapE(function(_){
           if(table.countUsers() == 0)
                my.removeTable(table.id);
           // update the table list either way
           nowfx.everyone.updateTables(my.getAllTables());
        });
       
        // After each join, update the table list for all users
        table.joinedE.mapE(function(_){
           nowfx.everyone.updateTables(my.getAllTables());
        });
        
        return table;
    }
    
    /**
     * Adds an existing table to the system.
     * @table is an instance of SavedTable.
     */
    my.loadTable = function(table) {
        return my.addTable(table.name,table.width,table.height,table.shapes);
    };

    /**
     * Retrieves a table from the system
     * @returns false if table doesn't exist
     */
    my.getTable = function(id) {
        if(id in tables)
            return tables[id];
        else
            return false;
    };

    /**
     * Remove a table from the system.
     */
    my.removeTable = function(id) {
        delete tables[id];
        nowfx.everyone.updateTables(my.getAllTables());
    };
    
    /**
     * Get all tables in their externalized form.
     * i.e: {width,height,userCount}
     */
    my.getAllTables = function() {
        var tbls = new Array();
        for(var tid in tables) {
            tbls.push(tables[tid].externalize());
        }
        return tbls;
    }
    
    return my;
    
}());