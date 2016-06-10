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
			checkMaybeIsEnd();
			Grupa
				.findOne({ aktywna: true, oceniona: false })
				.populate('listastartowa') // <--
				.exec(function (err, grupa) {	
					if(grupa === null){
						console.log('brak aktywnych grup');
					}
						else{
						objGrupa = grupa;
						console.log('konie: ' + grupa);
						grupa.sedziowie.forEach(function(sedzia){ // <-- jak null to sypie
							//console.log('sedzia._id ' + sedzia);
							//console.log('judgeId ' + judgeId);
								if(sedzia == judgeId){
									
									setTimeout(function() {
										socket.emit('judge connected', objGrupa);
									},300);
								}	
						});
					}
				});	
		});
		socket.on('get horse table', function (data) { //horseTable, judgeId
			var horseTable = [];
			var votedHorses = [];
			data.horseTable.forEach(function(elem){
				//console.log('get horse table horseId: ' + elem.id_horse);
				Horse
					.findOne({ _id: elem.id_horse})
					.exec(function (err, horse) {	
						//console.log('get horse table one: ' + horse);
						horseTable.push(horse);
					});
				});
			setTimeout(function() {
				//console.log('data.judgeId: ' + data.judgeId);
				OcenaSedziego.find({id_sedzia:data.judgeId}).exec(function (err, oceny){
					//console.log('oceny: ' + oceny);
					if(oceny !== undefined){
						//console.log('2oceny: ' + oceny);
						oceny.forEach(function(ocena){
							//console.log('ocena: ' + ocena.id_horse);
							votedHorses.push(ocena.id_horse);
						});
					}
				});
				setTimeout(function() {
				console.log('votedHorses: ' + votedHorses);
				socket.emit('get horse table', {horseTable:horseTable, votedHorses:votedHorses});
				},50);
			},300);
		}); 
		socket.on('create ocena_sedziego', function (data) {
			//data: typ, glowa, kloda, nogi, ruch, idHorse, idJudge
				var ocena = Ocena;
                var obj1 = new ocena({
                    typ: data.typ,
                    glowa: data.glowa,
					kloda: data.kloda,
                    nogi: data.nogi,
					ruch: data.ruch
                });
                obj1.save(function (err, item) {});
				var ocenaSedziego = OcenaSedziego;
                var obj2 = new ocenaSedziego({
                    id_horse: data.idHorse,
					id_ocena: obj1._id,
					id_sedzia: data.idJudge
                });
                obj2.save(function (err, item) {});
				Grupa.findOne({ aktywna: true, oceniona: false }).exec(function (err, grupa){
						  if (err) console.log(err);
							  grupa.ocenysedziow.push(obj2._id);	
							  grupa.save(function (err, item) {});		
				});
				setTimeout(function() {
					refreshVotes(false); // <-- odswiezamy liste u widzow
					//checkMaybeIsEnd();
				},400);
		});
		
		var checkMaybeIsEnd = function(){
			Grupa
				.findOne({ aktywna: true, oceniona: false })
				.populate('listastartowa') // <--
				.exec(function (err, grupa) {
					if(grupa === null){
						console.log('check brak aktywnej grp ');
					}else{
						
						console.log('check grupa: ' + grupa);	
					var liczbaSedziow = grupa.sedziowie.length;
					var liczbaKoni = grupa.listastartowa.length;
					var liczbaOcen = grupa.ocenysedziow.length;
					var sumaTyp = 0;
					var sumaGlowa = 0;
					var sumaKloda = 0;
					var sumaNogi = 0;
					var sumaRuch = 0;
					var listaKoni = [];
					console.log('ilosc sedziow: ' + liczbaSedziow);
					console.log('ilosc koni: ' + liczbaKoni);
					console.log('ilosc ocenSedziow: ' + liczbaOcen);
					console.log('grupa.ocenysedziow: ' + grupa.ocenysedziow);
					//TODO sprawdzić czy liczbaKoni * liczbaSedziow = liczbaOcen
					// wtedy mamy koniec zawodów
					var stanOcen = liczbaOcen-(liczbaKoni*liczbaSedziow);
					// jak 0 to all glosowali, - to jeszcze nie
					console.log('stan ocen: ' + stanOcen);
					if(stanOcen >= 0){
						console.log('weszlo');
						
						grupa.listastartowa.forEach(function(elemListy){
							console.log('1. elemListy_id: ' + elemListy.id_horse);
							setTimeout(function() {
							OcenaSedziego.find({id_horse: elemListy.id_horse}).exec(function (err, listaZGrp) {
								console.log('2. listaZGrp: ' + listaZGrp);
											sumaTyp = 0;
											sumaGlowa = 0;
											sumaKloda = 0;
											sumaNogi = 0;
											sumaRuch = 0;
									listaZGrp.forEach(function(oneHorseRatings){
										console.log('3. oneHorseRatings: ' + oneHorseRatings);
										Ocena.findOne({_id:oneHorseRatings.id_ocena}).exec(function (err, oneRating){
											sumaTyp += oneRating.typ;
											sumaGlowa += oneRating.glowa;
											sumaKloda += oneRating.kloda;
											sumaNogi += oneRating.nogi;
											sumaRuch += oneRating.ruch;
											console.log('Jedna: '+ sumaTyp + ', '+ sumaGlowa + ', '+ sumaKloda + ', ');
										});
									});
									setTimeout(function() {
										//socket.emit('get horse table', horseTable);
											console.log('Typsuma: '+ sumaTyp + ', sedziowie:' + liczbaSedziow);
											sumaTyp = sumaTyp/liczbaSedziow;
											sumaGlowa = sumaGlowa/liczbaSedziow;
											sumaKloda = sumaKloda/liczbaSedziow;
											sumaNogi = sumaNogi/liczbaSedziow;
											sumaRuch = sumaRuch/liczbaSedziow;
											console.log('Wyliczona: '+ sumaTyp + ', '+ sumaGlowa + ', '+ sumaKloda + ', ');
											// z tego zrobić ocene


										var ocenaModel = Ocena;
										var newOcena = new ocenaModel({
											typ: sumaTyp,
											glowa: sumaGlowa,
											kloda: sumaKloda,
											nogi: sumaNogi,
											ruch: sumaRuch
										});
										setTimeout(function() {
											sumaTyp = 0;
											sumaGlowa = 0;
											sumaKloda = 0;
											sumaNogi = 0;
											sumaRuch = 0;
										},20);
										console.log('new Ocena: ' + newOcena);
										newOcena.save(function (err, item) {});
											// wstawic to do elem listy start
										console.log('listaZGrp._id: ' + elemListy.id_horse + ' id_grupa: ' + grupa._id);
										Element.findOne({id_horse: elemListy.id_horse, id_grupa: grupa._id}).exec(function (err, elementRated){
											if (err) console.log(err);
											console.log('przed dodaniem oceny: ' + elementRated.id_ocena);
											elementRated.id_ocena= newOcena;	
											console.log('po dodaniu oceny: ' + elementRated.id_ocena);
											elementRated.save(function (err, item) {});
										});
									},50);
							});
							},30);
							
							// Wyłączenie grupy -------------------------------------------
							grupa.aktywna = false;
							grupa.oceniona = true;
							grupa.save(function (err, item) {});
							setTimeout(function() { // czyszczenie ocen sedziow
								 console.log('remove ratings from grp: ' + grupa._id);
								 OcenaSedziego.find({}).remove().exec();
							},1000);
							// <--- Tu emit nowego rankingu grupy
						});	
					}else{
						console.log('brakuje jeszcze glosow');
					}
			      }// koniec ifa
				});
		};
		
		// Widzowie -------------------------
		socket.on('get votes', function () {
			refreshVotes(true);
		});
		
		var refreshVotes = function(spectatorEnter){ // true, false
			console.log('refreshVotes <-------------------------');
			Grupa
				.findOne({ aktywna: true, oceniona: false })
				.populate('listastartowa') // <--
				.exec(function (err, grupa) {
					if (grupa === null){
						console.log('nie ma aktywnej grp');
					}else{
						console.log('grupa = ' + grupa);
					var liczbaSedziow = grupa.sedziowie.length;
					var liczbaKoni = grupa.listastartowa.length;
					var liczbaOcen = grupa.ocenysedziow.length;
					var sumaTyp = 0;
					var sumaGlowa = 0;
					var sumaKloda = 0;
					var sumaNogi = 0;
					var sumaRuch = 0;
					//var nazwiskoSedziego = "";
					//var nazwaKonia = "";
					var tabelaWynikow = [];
					//console.log('ilosc sedziow: ' + liczbaSedziow);
					//console.log('ilosc koni: ' + liczbaKoni);
					//console.log('ilosc ocenSedziow: ' + liczbaOcen);
					//console.log('grupa.ocenysedziow: ' + grupa.ocenysedziow);
					//TODO sprawdzić czy liczbaKoni * liczbaSedziow = liczbaOcen
					// wtedy mamy koniec zawodów	
					grupa.listastartowa.forEach(function(elemListyStart){  // < -- kazdy elementListy
					//console.log('1. elemListyStart.id_horse: ' + elemListyStart.id_horse);
						grupa.ocenysedziow.forEach(function(ocenaSedziego){   // < -- kazda ocena sedziego
							//TODO znaleźć ocene sedziego
							OcenaSedziego  // < -- jedna ocena
							.findOne({ _id: ocenaSedziego})
							.exec(function (err, ocenaSedziego2) {
								var ocenionyKon = ocenaSedziego2.id_horse;
								var konListaSt = elemListyStart.id_horse;
								//console.log('kon z oceny:' + ocenionyKon+'.');
								//console.log('kon z l. st:' + konListaSt+'.');
								//console.log('idOceny    : ' + ocenaSedziego2.id_ocena);
								//console.log('-----------------------');
								if(ocenionyKon.equals(konListaSt) === true){
										//console.log('2. idOceny: ' + ocenaSedziego2.id_ocena);
										Ocena
											.findOne({ _id: ocenaSedziego2.id_ocena})
											.exec(function (err, ocenaDB) {
												/*console.log('----------------------');
												console.log('ID ' + ocenaDB._id);
												console.log('Typ' + ocenaDB.typ);
												console.log('glowa' + ocenaDB.glowa);
												console.log('kloda' + ocenaDB.kloda);
												console.log('nogi' + ocenaDB.nogi);
												console.log('ruch' + ocenaDB.ruch);*/
												Horse  // < -- Kon
													.findOne({ _id: konListaSt})
													.exec(function (err, kon) {
														//nazwaKonia = kon.nazwa;
														//console.log('Koń: ' + kon.nazwa);
													Account  // < -- Sedzia
														.findOne({ _id: ocenaSedziego2.id_sedzia})
														.exec(function (err, sedzia) {
															//nazwiskoSedziego = sedzia.nazwisko;
															//console.log('Sedzia: ' + sedzia.nazwisko);
															var objVote = {
																typ:ocenaDB.typ,
																glowa:ocenaDB.glowa,
																kloda:ocenaDB.kloda,
																nogi:ocenaDB.nogi,
																ruch:ocenaDB.ruch,
																nazwaKonia:kon.nazwa,
																nazwiskoSedziego:sedzia.nazwisko
															};
															tabelaWynikow.push(objVote);
															//nazwaKonia = "";
															//nazwiskoSedziego = "";
														});
												});
										});
									}
							});
						}); 
					});
					setTimeout(function() {
						if(spectatorEnter === true){
							socket.emit('refresh votes',tabelaWynikow);
						}else{
							socket.broadcast.emit('refresh votes',tabelaWynikow);
						}	
					},200);
				   } // end if
				});
		};
		
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
			var quantity = 0;
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
			console.log('add randomJudges to group',data.randomJudgesList.length);
			data.randomJudgesList.forEach(function(randJudge){	
				console.log('przed odczytany judge _id: ' + randJudge._id);
				Account.find({_id: randJudge._id}).exec(function (err, judge){
							if (err) console.log(err);		  
							Grupa.findOne({nazwa: data.groupName}).exec(function (err, grupa){
							  if (err) console.log(err);
								//console.log('grupa.sedziowie',grupa.sedziowie);
								//console.log('randJudge._id',randJudge._id);
								//function findById(id) {
								//  return _.contains(_.pluck(grupa.sedziowie, '_id'), randJudge._id);
							//	}
							  //if(contains.call(grupa.sedziowie,randJudge._id)){
							    if(_.contains(_.pluck(grupa.sedziowie, '_id'), randJudge._id)){
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
						//console.log('juz jest taka grp');
					}else{
						//console.log('add grp to comp');
						zawody.grupy.push(data.groupId);
						zawody.save(function (err, item) {});
					}
				});
        });	

		var _ = require('underscore');
		socket.on('remove group from comp', function (data) { // idCompetitions, idGroup
            console.log('idCompetitions: ' + data.idCompetitions);
			console.log('idGroup: ' + data.idGroup);
			// usunięcie id grupy z zawodów

			Zawody.findOne({_id: data.idCompetitions}).exec(function (err, zawody){
				console.log('usuwam grp z zawodow: ' + data.idGroup);
				console.log('zawody przed: ' + zawody.grupy);
				zawody.grupy = _.without(zawody.grupy, data.idGroup);
				console.log('zawody po: ' + zawody.grupy);
				zawody.save(function (err, item) {});
			});
			console.log('usuwam liste: ' + data.idGroup);
			Element.find({ id_grupa: data.idGroup }).remove().exec();
			// usunięcie grupy o takim id
			console.log('usuwam grp: ' + data.idGroup);
            Grupa.findOne({ _id: data.idGroup }).remove().exec();
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
                player.save(function (err, item) {});
        });
        socket.on('get horses', function () {
            Horse.find({}).exec(function (err, players){
            socket.emit('get horses', players);
            });
			//console.log('get horses');
        });
		socket.on('get one sex horses', function (sex) { // Klacz, Koń
            Horse.find({plec:sex}).exec(function (err, players){
            socket.emit('get one sex horses', players);
            });
			//console.log('get horses');
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
    });   
};

