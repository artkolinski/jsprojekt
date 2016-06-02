/*jshint node: true */
var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var mongoose = require('mongoose'); 
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var serveStatic = require('serve-static');
var ConnectRoles = require('connect-roles');

app.use(favicon('views/images/favicon.ico'));
app.use(serveStatic("views"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
var secret = process.env.APP_SECRET || 'tajne';
app.use(expressSession({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));
app.set('port', process.env.PORT || 3000);
var configDB = require('./server/database');

// Modele ------------------------------------
var Account = require('./models/account');
var Element = require('./models/element.listy.startowej');
var Grupa = require('./models/grupa');
//var GrupaElement = require('./models/grupa_element.listy.startowej');
var Horse = require('./models/horse');
var Ocena = require('./models/ocena');
var OcenaSedziego = require('./models/ocena_sedziego');
//var SedziaGrupa = require('./models/sedzia_grupa');
var Zawody = require('./models/zawody');
//var ZawodyGrupa = require('./models/zawody_grupa');

// Konfiguracja Logowania ------------------------------------
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
var LocalStrategy = require('passport-local').Strategy;
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Role ------------------------------------
var role = new ConnectRoles({
  failureHandler: function (req, res, action) {
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render('access-denied', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});
app.use(role.middleware());
require('./server/roles.js')(app, role);

// Baza ------------------------------------
mongoose.connect('mongodb://localhost/projekt');
var db = mongoose.connection;
db.on('open', function () {
    console.log('Connected with MongoDB!');
});

// Routing ------------------------------------
require('./server/routes.js')(app, passport, Account, role);

// HTTPS ------------------------------------
var fs = require('fs');
var https = require('https');
var options = {
  key: fs.readFileSync('server/encryption/key.pem'),
  cert: fs.readFileSync('server/encryption/server.crt'),
};
var ssl = https.createServer(options, app);
ssl.listen(443, function () {
   console.log('https://localhost  Started!');
});

// Sockety ------------------------------------
var io = require('socket.io')(ssl);
require('./server/sockets.js')(io, Horse, Account, Element, Grupa, Ocena, OcenaSedziego, Zawody);

/* HTTP ------------------------------------
http.listen(3000, function(){
 console.log('http://localhost:3000  Started!');
});
*/

