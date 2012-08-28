/**
 * User MODEL
 * 
 * Implements storage and representation of users. This also includes tables
 * saved by users and guest users.
 * 
 * @author Ben Corne
 */
GLOBAL.UserManager = (function(){
    
    var my = {};
    
    /** user management **/
    var users = {};
    var reserved = ['guest'];
    var allowed = /^[a-zA-Z0-9_]*$/;
    var min_length = 3;
    var gid = 0;

    /**
     * {
     *  nickname: The nickname of this user,
     *  guest: If the user is a guest or a registered user,
     *  tables: An array of tables this user saved,
     *  current: The current table this user is on,  
     * }
     */
    function User(nickname) {
        this.nickname = nickname;
        this.guest = false;
        this.tables = {};
        this.current = false;
    }
    
    /**
     * @see TableManager.Table
     * Additional properties: save name and date.
     */
    function SavedTable(name,width,height,shapes) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.shapes = shapes.slice(0);
        this.date = new Date();
    }
    
    /**
     * Save the current table for this user.
     * @param name The name the table should be saved on.
     */
    User.prototype.saveTable = function(name) {
        var table = this.current;
        this.tables[name] = new SavedTable(name,
            table.width,table.height,table.shapes);
    };
    
    /**
     * Get the array of saved tables for this user.
     */
    User.prototype.getSaves = function() {
        var saves = new Array();
        for(var name in this.tables) {
            saves.push(this.tables[name]);
        }
        return saves;
    }
    
    /**
     * Get the saved table identified by the given name. False if not found.
     */
    User.prototype.getSave = function(name) {
        if(name in this.tables)
            return this.tables[name];
        else
            return false;
    }
   
    /**
     * Check if the user is already drawing.
     */
    User.prototype.isDrawing = function() {
        return Boolean(this.current);
    };
    
    /**
     * Update the current table for the user.
     * @param table The table we join.
     */
    User.prototype.joinTable = function(table) {
        this.current = table;
    };
    
    
    /**
     * Remove the current table for the user.
     */
    User.prototype.leaveTable = function() {
        this.current = false;
    };
    
    /**
     * Pretty print the table name.
     */
    SavedTable.prototype.pretty = function() {
        return name+' ('+width+'x'+height+')';
    };

    /**
    * Adds a new user to the system.
    * @throws IllegalNickname Nickname contains disallowed symbols.
    * @throws ReservedNickname Nickname is reserved.
    * @returns the freshly added user.
    */
    my.addUser = function(nickname) {
        
        if(!nickname.match(allowed)) throw {
            name:'IllegalNickname',
            message:'Nickname contains disallowed symbols.'
        };
        
        if(nickname.length < min_length) throw {
            name:'TooShortNickname',
            message:'Nickname must be at least '+min_length+' long.'
        };

        if(reserved.indexOf(nickname) != -1) throw {
            name:'ReservedNickname',
            message:'Nickname is reserved.'
        };

        var user = new User(nickname);
        users[nickname] = user;
        return user;
    };
    
    /**
     * Adds a new guest to the system.
     */
    my.addGuest = function() {
        var user = new User('guest'+gid);
        user.guest = true;
        gid++;
        return user;
    };

    /**
     * Retrieves a user from the system
     * @returns false if user doesn't exist, User object otherwise
     */
    my.getUser = function(nickname) {
        if(nickname in users)
            return users[nickname];
        else
            return false;
    };
    
    return my;
    
}());