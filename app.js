/**
 * Entry point for launching the webserver hosting the drawing application.
 * 
 * @author Ben Corne
 */

/**
 * Module dependencies.
 */
require('./libs/flapjax-2.1.js');
require('./libs/nowfx.server.js');
require('./libs/array.remove.js');

var express = require('express');
var app = module.exports = express.createServer();
var secret = 'omgwtfbbq';

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: secret }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes (url -> view mapping)
var routes = require('./routes');
routes.initialize(app);

// Initialize nowfx
nowfx.initialize(app);

// Backend (db / inmemory)
require('./server/UserManager.js');
require('./server/TableManager.js');

// Controllers: nowfx code
require('./now/login.js');
require('./now/register.js');
require('./now/loggedin.js');
require('./now/draw.js');

app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode",
  app.address().port, app.settings.env);
});