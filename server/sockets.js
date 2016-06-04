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
		
		// Start grupy -------------------------
		socket.on('start group', function (data) { //idGrupy, idCompetitions, nameComp
			Grupa.findOne({_id: data.idGrupy}).exec(function (err, grupa){
				console.log('Grupa przy starcie', grupa);
				if(grupa.aktywna === false){
					grupa.aktywna = true;
					grupa.save(function (err, item) {});
				}else{
					console.log('this group is active');
				}
			});
		});
		
		// Sedziowie -------------------------
		socket.on('judge connected', function (judgeId) { 
			var objGrupa;
			Grupa
				.findOne({ aktywna: true, oceniona: false })
				.populate('listastartowa') // <--
				.exec(function (err, grupa) {	
					objGrupa = grupa;
					console.log('konie: ' + grupa);
					//console.log('konie 0: ' + grupa.listastartowa[0]);
					//console.log('konie id: ' + grupa.listastartowa[0].id_horse);
					//console.log('zawody: ' + zawody.grupy.nazwa);
				//	groupList = zawody;
				});
			setTimeout(function() {
				socket.emit('judge connected', objGrupa);
			},300);
		});
		socket.on('get horse table', function (listastartowa) {
			var horseTable = [];
			listastartowa.forEach(function(elem){
				console.log('get horse table horseId: ' + elem.id_horse);
				Horse
					.findOne({ _id: elem.id_horse})
					.exec(function (err, horse) {	
						console.log('get horse table one: ' + horse);
						horseTable.push(horse);
					});
				});
			setTimeout(function() {
				socket.emit('get horse table', horseTable);
			},300);
		}); 
		
		
		// Wyświetlanie grup -------------------------
		socket.on('get groups', function (data) {
			var groupList;
			Zawody
				.findOne({ _id: data.idCompetitions })
				.populate('grupy') // <--
				.exec(function (err, zawody) {			  
					//console.log('zawody: ' + zawody);
					//console.log('zawody: ' + zawody.grupy.nazwa);
					groupList = zawody;
				});
			setTimeout(function() {
				socket.emit('downloaded groups', groupList);
			},300);
		});
		
		var contains = function(needle) {
				var findNaN = needle !== needle;
				var indexOf;

				if(!findNaN && typeof Array.prototype.indexOf === 'function') {
					indexOf = Array.prototype.indexOf;
				} else {
					indexOf = function(needle) {
						var i = -1, index = -1;

						for(i = 0; i < this.length; i++) {
							var item = this[i];

							if((findNaN && item !== item) || item === needle) {
								index = i;
								break;
							}
						}

						return index;
					};
				}

				return indexOf.call(this, needle) > -1;
			};
		
		// Dodawanie grupy -------------------------		
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
		socket.on('add horse to list', function(data){ // Dodanie relacji <-------
            var model = Element;
                var obj = new model({
                    numerstartowy: data.numerstartowy,
                    id_horse: data.id_horse,
					id_grupa: data.id_grupa
                });		
				obj.save(function (err, item) {});
				socket.emit('horseList id', obj._id);
        });	
		socket.on('add horseElem to group', function(data){	// Złączenie <-------	
			Element.find({_id: data.horseElemId}).exec(function (err, element){
						  if (err) console.log(err);
							Grupa.findOne({nazwa: data.groupName}).exec(function (err, grupa){
							  if (err) console.log(err);
							  grupa.listastartowa.push(data.horseElemId);	
							  grupa.save(function (err, item) {
							  });
							});
				});
        });	
		socket.on('random judges', function(compId){
			var quantity;
			Zawody.findOne({_id: compId}).exec(function (err, zawody){
							  if (err) console.log(err);
							  quantity = zawody.liczbasedziow;
							  });
			
			var randomJudges = [];
			var randomNumbers = [];
			Account.find({role: "sedzia"}).exec(function (err, judge){
				var length = judge.length;
				var generatedNumber = Math.floor((Math.random() * length) + 0);
				while(randomNumbers.length < quantity){
					if(contains.call(randomNumbers,generatedNumber)){
						generatedNumber = Math.floor((Math.random() * length) + 0);
					}else{
						randomNumbers.push(generatedNumber);
					}
				}
				randomNumbers.forEach(function(number){
					randomJudges.push(judge[number]);
				});

				socket.emit('random judges', randomJudges);
				console.log('random judges: ', randomJudges);
				console.log('quantity: ', quantity);
            });
		});	
		socket.on('add randomJudges to group', function(data){	// Złączenie <-------	
			data.randomJudgesList.forEach(function(randJudge){
				console.log('przed odczytany judge _id: ' + randJudge._id);
				Account.find({_id: randJudge._id}).exec(function (err, judge){
							if (err) console.log(err);		  
							Grupa.findOne({nazwa: data.groupName}).exec(function (err, grupa){
							  if (err) console.log(err);
							  if(contains.call(grupa.sedziowie,randJudge._id)){
								 console.log('juz mamy takiego randomJudg');
								 }else{
								 	grupa.sedziowie.push(randJudge._id);	
									grupa.save(function (err, item) {});
								 }	  
							});		
				});
			});
        });	
		socket.on('add group to comp', function(data){	// Złączenie <-------
				Zawody.findOne({_id: data.compId}).exec(function (err, zawody){
					if (err) console.log(err);
					if(contains.call(zawody.grupy,data.groupId)){
						console.log('juz jest taka grp');
					}else{
						zawody.grupy.push(data.groupId);
						zawody.save(function (err, item) {});
					}
				});
        });	
		//TODO usuwanie grupy
		/*
		socket.on('remove group from comp', function (data) {
            console.log('remove group: ' + data.idGrp);
			Zawody.findOne({_id: data.compId}).exec(function (err, zawody){
				_.without(zawody.grupy, _.findWhere(zawody.grupy, data.idGrp));
			});
            //Grupa.find({ _id: data.id }).remove().exec();
        });
		var _ = require('underscore');
		*/
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

