/*jshint node: true */
var express = require('express');
var path = require('path');
var mongoose = require('mongoose'); 
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var serveStatic = require('serve-static');
var io = require('socket.io')(http);
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
var Horse = require('./models/horse');

// Konfiguracja Logowania ------------------------------------
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
var LocalStrategy = require('passport-local').Strategy;
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Baza ------------------------------------
mongoose.connect('mongodb://localhost/projekt');
var db = mongoose.connection;
db.on('open', function () {
    console.log('Connected with MongoDB!');
});

// Routing ------------------------------------
require('./server/routes.js')(app);

// ------------------------------------
io.on('connection', function(socket){
    console.log('new user connected');
    socket.on('user connected', function(nick){
        socket.username = nick;
        socket.emit('user connected', msgHistory, rooms);
    });
    socket.on('add horse', function(data){
        console.log('add horse');
        var playerModel = require('./models/horse.js');
            var player = new playerModel({
                nazwa: data.nazwa,
                plec: data.plec,
                hodowca: data.hodowca
            });
            player.save(function (err, item) {
                console.dir(err);
                console.log(item);
            });
    });
    socket.on('get horses', function () {
        console.log('get all horses');
        Horse.find({}).exec(function (err, players){
        socket.emit('get horses', players);
        });
    });
    socket.on('remove horse', function (data) {
        console.log('remove horse: ' + data.id);
        Horse.find({ _id: data.id }).remove().exec();
    });
    socket.on('update horse', function (data){
        console.log('update horse: ' + data.id);
        Horse.update({_id: data.id}, data, function(err, numberAffected, rawResponse) {

        });
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

// SSL ------------------------------------
var fs = require('fs');
var https = require('https');

var options = {
  key: fs.readFileSync('server/encryption/key.pem'),
  cert: fs.readFileSync('server/encryption/server.crt'),
};

https.createServer(options, app).listen(443, function () {
   console.log('https://localhost  Started!');
});

// Sockety ------------------------------------
http.listen(3000, function(){
  console.log('http://localhost:3000  Started!');
});
