/**
 * This file implements the mapping between urls and rendering the correct
 * views.
 * 
 * Some views aren't mapped anymore as they are rendered and sent over via
 * now.js's sockets when required by the client. This is due to an issue with
 * the session support now.js provides for express. (express doesn't see changes
 * made to the now.js session object).
 * 
 * @depends express.flapjax.js
 * @author Ben Corne
 */

var fje = require('./../libs/express.flapjax.js');

exports.initialize = function(app) {
    
    // GET /
    var getIndexE = fje.requestE(app,'get','/');
    getIndexE.mapE(function(request){
        request.res.render('index',{title:'Draw'});
    });
    
    // GET /login
    var getLoginE = fje.requestE(app,'get','/login');
    getLoginE.mapE(function(request){
        request.res.render('login');
    });

    // GET /register
    var getRegisterE = fje.requestE(app,'get','/register');
    getRegisterE.mapE(function(request) {
        request.res.render('register');
    });
    
    /*
    // GET /loggedin
    var getLoggedinE = fje.requestE(app,'get','/loggedin');
    getLoggedinE.mapE(function(request) {
       console.log('express session output = ');
       console.log(request.req.session);
       ifLoggedIn(request,'loggedin');
    });
    
    // GET /draw/:id
    var getDrawE = fje.requestE(app,'get','/draw/:id');
    getDrawE.mapE(function(request) {
       ifLoggedIn(request,'draw');
    });
    */
};