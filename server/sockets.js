/*jshint node: true */
module.exports = function (io, Horse, Account, Element, Grupa, Ocena, OcenaSedziego, Zawody) {
    io.on('connection', function(socket){
        /*console.log('new user connected');
        socket.on('user connected', function(nick){
            socket.username = nick;
            socket.emit('user connected');
        });*/
        // CRUD Competition -------------------------
		socket.on('add competition', function(data){
            var compModel = Zawody;
                var comp = new compModel({
                    nazwa: data.nazwa,
                    ocena: data.ocena,
					liczbasedziow: data.liczbasedziow,
                    aktywne: false,
					zakonczone: false
                });
				comp.save(function (err, item) {
                    console.dir(err);
                    console.log(item);
                });
        });
		socket.on('add group', function(data){
            var model = Grupa;
                var obj = new model({
                    nazwa: data.nazwa,
                    plec: data.plec,
                    oceniona: false,
					aktywna: false
                });
				obj.save(function (err, item) {
                    console.dir(err);
                    console.log(item);
                });
					socket.emit('group id', obj._id);
        });	
		socket.on('get competitions', function () {
            Zawody.find({}).exec(function (err, list){
            socket.emit('get competitions', list);
				console.log('get competitions',list);
            });
        });
		socket.on('remove competition', function (data) {
            console.log('remove competition ' + data.id);
            Zawody.find({ _id: data.id }).remove().exec();
        });
		socket.on('judges count', function () {			
            Account.find({role: "sedzia"}).exec(function (err, players){
				var count = players.length;
            socket.emit('judges counted', count);
			console.log('counted judges: ', count);
            });
        });
		
		
		
        // Horses -------------------------       
        socket.on('add horse', function(data){
            console.log('add horse');
            var playerModel = require('../models/horse.js');
                var player = new playerModel({
                    nazwa: data.nazwa,
                    plec: data.plec,
					dataur: data.dataur,
                    hodowca: data.hodowca
                });
                player.save(function (err, item) {
                    console.dir(err);
                    console.log(item);
                });
        });
        socket.on('get horses', function () {
            Horse.find({}).exec(function (err, players){
            socket.emit('get horses', players);
            });
			console.log('get horses');
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
        
        /*socket.on('disconnect', function(){
            console.log('user disconnected');
        });*/
    });   
};

