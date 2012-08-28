============================================================================================ 
 __                             __                                __      __               
 /\ \                           /\ \                            __/\ \__  /\ \              
 \_\ \  _ __   __    __  __  __ \ \ \____    __    ___     ___ /\_\ \ ,_\ \ \ \____    __   
 /'_` \/\`'__/'__`\ /\ \/\ \/\ \ \ \ '__`\ /'__`\/' _ `\ /' _ `\/\ \ \ \/  \ \ '__`\ /'__`\ 
/\ \L\ \ \ \/\ \L\.\\ \ \_/ \_/ \_\ \ \L\ /\  __//\ \/\ \/\ \/\ \ \ \ \ \_ _\ \ \L\ /\  __/ 
\ \___,_\ \_\ \__/.\_\ \___x___//\_\ \_,__\ \____\ \_\ \_\ \_\ \_\ \_\ \__/\_\ \_,__\ \____\
 \/__,_ /\/_/\/__/\/_/\/__//__/ \/_/\/___/ \/____/\/_/\/_/\/_/\/_/\/_/\/__\/_/\/___/ \/____/
                                                                                            
                                                                                            
============================================================================================

0. Hello!
---------
This is a drawing web application written by Ben Corne. It is written in HTML and
Javascript. Technologies used are node.js, express, jade, HTML5 and now.js. An example
running application can be found at http://draw.bennit.be.

1. Installation
---------------
To use this application, you need node v0.6.16+. You can install and use different versions
of node using nvm (https://github.com/creationix/nvm/).

After node is installed, go to the main directory and type
   npm install.
In case the now dependency is not installed automatically, try installing it explicitly:
   npm install now

Now in the main directory type
   node app.js

and visit your drawing application on http://localhost:8080

2. Code
-------

The application is implemented as a variation on the MVC-pattern.

draw
|--- libs   : external libraries not in npm's repository
|--- now    : controllers for now.js requests
|--- routes : controllers for http requests
|--- server : model and persistence
|--- views  : views that can be rendered by a jade compiler
|--- public : static hosted files on the webserver
     |--- fonts       : Webfonts using CSS3
     |--- images      : Images used in the website
     |--- stylesheets : CSS stylesheets for each view
     |--- javascripts : client-side code
          |--- libs    : External JS libraries
          |--- loaders : JS executed after loading it's corresponding view
          |--- tools   : Draw module's tool declarations       