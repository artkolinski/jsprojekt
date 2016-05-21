/*jshint node: true */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var mongoose = require('mongoose');
var serveStatic = require('serve-static');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose'); 
app.use(serveStatic("views"));
app.set('view engine', 'ejs');

var port = process.env.PORT || 3000;
var secret = process.env.APP_SECRET || 'tajne';
var configDB = require('./config/database');

var Horse = require('./models/horse.js');

// Konfiguracja Logowania ------------------------------------
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
// ---------

mongoose.connect('mongodb://localhost/projekt');
var db = mongoose.connection;
db.on('open', function () {
    console.log('Connected with MongoDB!');
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(expressSession({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));

app.get('/admin/horses', function (req, res) {
    res.render('admin/horses');
});

// Passport ------------------------------------
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

 app.get('/', function (req, res) {
      res.render('index', { 
          user : req.user,
          login: req.isAuthenticated() });
  });
    
  app.get('/admin/register', function(req, res) {
      res.render('register', { });
  });

  app.post('/admin/register', function(req, res) {
    Account.register(new Account({username : req.body.username, nazwisko: req.body.nazwisko}), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });
  });

  app.get('/login', function(req, res) {
      res.render('login', { user : req.user });
  });

  app.post('/login', passport.authenticate('local'), function(req, res) {
      res.redirect('/');
  });

  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });

// ---------


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

http.listen(port, function(){
    console.log('listening on *:' + port);
});