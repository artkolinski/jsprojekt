/*jshint node: true */
module.exports = function (io, Horse, Account) {
    io.on('connection', function(socket){
        console.log('new user connected');
        socket.on('user connected', function(nick){
            socket.username = nick;
            socket.emit('user connected');
        });
        
        // Horses -------------------------       
        socket.on('add horse', function(data){
            console.log('add horse');
            var playerModel = require('../models/horse.js');
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
        
        
        // Accounts -------------------------
        socket.on('get accounts', function () {
            console.log('get all accounts');
            Account.find({}).exec(function (err, accounts){
            socket.emit('get accounts', accounts);
            });
        });
        socket.on('remove account', function (data) {
            console.log('remove account: ' + data.id);
            Account.find({ _id: data.id }).remove().exec();
        });
        socket.on('update account', function (data){
            console.log('update account: ' + data.id);
            Account.update({_id: data.id}, data, function(err, numberAffected, rawResponse) {
            });
        });
        
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });   
};

