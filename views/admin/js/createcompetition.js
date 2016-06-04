/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var socket = io();
// Dodawanie zawodów -----------------------------------------------------------------
var addCompetition = document.getElementById('addCompetitionWindow');
var addCompetitionButt = document.getElementById('addCompetitionButt');
var cancelAddCompetition = document.getElementById('cancelAddCompetition');

// Grupy -----------------------------------------------------------------
var addGroup = document.getElementById('addGroupWindow');
var addGroupButt = document.getElementById('addGroupButt');
var cancelAddGroup = document.getElementById('cancelAddGroup');
var horseLeftSelect = document.getElementById('horseLeftSelectList');
var horseRightSelect = document.getElementById('horseRightSelectList');
var fromLeftToRight = document.getElementById('fromLeftToRight');
var fromRightToLeft = document.getElementById('fromRightToLeft');
	
	// Wyświetlanie grup
var showGroupsWindow = document.getElementById('showGroupsWindow');
var showGroupsClose = document.getElementById('showGroupsClose');
var showGroupsTable = $('#showGroupsTable').DataTable({
    "iDisplayLength": -1,
    "aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
	"createdRow" : function( row, data, index ) {
        if( data.hasOwnProperty("id") ) {
            row.id = data.id;
        }       
    }
});

// Błędy -----------------------------------------------------------------
var error = document.getElementById('errorWindow');
var errorMessage = document.getElementById('errorMessage');

// Home -----------------------------------------------------------------
var listAddCompetition = document.getElementById('listAddCompetition');
var home = document.getElementById('homeWindow');
var cTable = $('#compTable').DataTable({
    "columnDefs": [ {
    "targets": [3,4,5,6,7],
    "orderable": false
    } ],
    "iDisplayLength": -1,
    "aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
    "createdRow" : function( row, data, index ) {
        if( data.hasOwnProperty("id") ) {
            row.id = data.id;
        }       
    }
});

// Wyświetlanie Grup -----------------------------------------------------------------
showGroupsClose.addEventListener('click', function(){
	hideAllShowHome();
});

var showGroupsFunc = function(idCompetitions, nameComp){
	hideAll();
	showGroupsWindow.style.display = 'block';
	
	console.log('idZaw: ' + idCompetitions + ' nazwaZaw: ' + nameComp);
	var data = {idCompetitions:idCompetitions, nameComp:nameComp};
	socket.emit('get groups',data);
	socket.on('downloaded groups', function (list) {	
		
		console.log('downloadedList: ' + list);
		console.log('downloadedListgrp: ' + list.grupy);
		console.log('---------------------------------');
		showGroupsTable.clear();
		list.grupy.forEach(function (oneGroup) {
			console.log('one Group: ' + oneGroup.nazwa);
			//console.log('one Groupid: ' + oneGroup._id);
			//console.log('++++++++++');
			var data =[ oneGroup.nazwa, oneGroup.aktywna, oneGroup.oceniona, '<button class="start-' + oneGroup._id + '">Start</button>','<button class="delete-' + oneGroup._id + '">Usuń</button>' ];
			data.id = oneGroup._id;
            showGroupsTable.row.add(data).draw();
			
			$('.start-'+oneGroup._id).click(function(){
                startGroupFunc(oneGroup._id, idCompetitions, nameComp);
            });			
			/* TODO Usuwanie pojedynczej grupy z zawodów
			$('.delete-'+oneGroup._id).click(function(){
                console.log('remove group: ' + list._id);
                socket.emit('remove group from comp', { idGrp: oneGroup._id, compId: compId });
				//oTable.fnDeleteRow(oTable.fnGetPosition(selected_tr));		//showGroupsTable.fnDeleteRow(showGroupsTable.fnGetPosition($('tr[name=docId]')));
				
            });
			*/
		});
	});
};

//Start Grupy -----------------------------------------------------------------
var startGroupFunc = function(idGrupy, idCompetitions, nameComp){
	var data = {idGrupy:idGrupy, idCompetitions:idCompetitions, nameComp:nameComp};
	socket.emit('start group', data);
	showGroupsFunc(idCompetitions, nameComp);
};


// Dodawanie Grupy -----------------------------------------------------------------
var compId = "";
var horsesLeft = [];
var horsesRight = [];
var numerStartowy = 1;
var idCompetitionFromTable;
cancelAddGroup.addEventListener('click', function(){
	hideAllShowHome();	
});

addGroupButt.addEventListener('click', function(){
	var nazwaGrupy = $('#nazwaGrupy').val();
    var plecGrupy = $('#plecGrupy').val();	
	socket.emit('add group',
		{
			nazwa: nazwaGrupy,
			plec: plecGrupy
		});	
	setTimeout(function() {
	socket.emit('random judges', compId);
	},200); // <-- opóźnia aby była grupa gdy przyjdzie odp od serv
		socket.on('group id', function (groupId) {		
			socket.on('horseList id', function (horseListId) {
				socket.emit('add horseElem to group',
				{
					groupName: nazwaGrupy,
					horseElemId: horseListId
				});			
			});
			horsesRight.forEach(function(horse){
				socket.emit('add horse to list',
				{
					numerstartowy: horse.nr,
					id_horse: horse.id,
					id_grupa: groupId
				});	
			});
			socket.on('random judges', function (randomJudgesList){
				socket.emit('add randomJudges to group', 
				{
					groupName: nazwaGrupy,
					randomJudgesList: randomJudgesList
				});
			});	
			setTimeout(function() {
				socket.emit('add group to comp', 
				{
					groupId: groupId,
					compId: compId
				});
			},1000); // <-- opóźnia aby na końcu dodać
		});
	//error.style.display = 'block';
	//errorMessage.innerHTML = "id " + horseListId;
	hideAllShowHome();	
});


fromLeftToRight.addEventListener('click', function(){
        var id = $("#horseLeftSelectList option:selected").attr('id');
        var nazwa = $("#horseLeftSelectList option:selected").attr('nazwa');
        var hodowca = $("#horseLeftSelectList option:selected").attr('hodowca');
        if(typeof id != 'undefined') { 
            console.log(nazwa + " ->");
            $("#horseLeftSelectList option:selected").remove();			
            $('#horseRightSelectList').append('<option id="' + id + '" nazwa="' + nazwa + '" hodowca="' + hodowca + '">' + 'Nr: ' + numerStartowy +  '  Nazwa: ' + nazwa + '  Hodowca: ' + hodowca + '</option>');
            var horse = {id:id, nr:numerStartowy, nazwa:nazwa, hodowca:hodowca};
			horsesLeft = _.without(horsesLeft, _.findWhere(horsesLeft, {id: id}));
            horsesRight.push(horse);
			numerStartowy += 1;
			console.log('HorsesLeft: ' + horsesLeft.length + ' Right: ' + horsesRight.length);
		}  
});

fromRightToLeft.addEventListener('click', function(){
	 	var id = $("#horseRightSelectList option:selected").attr('id');
        var nazwa = $("#horseRightSelectList option:selected").attr('nazwa');
        var hodowca = $("#horseRightSelectList option:selected").attr('hodowca');
        if(typeof id != 'undefined') { 
            console.log(nazwa + " <-");
			$('#horseRightSelectList').find('option').remove();
			horsesRight = _.without(horsesRight, _.findWhere(horsesRight, {id: id}));
			numerStartowy = 1;
			horsesRight.forEach(function(horse){
				$('#horseRightSelectList').append('<option id="' + horse.id + '" nazwa="' + horse.nazwa + '" hodowca="' + horse.hodowca + '">' + 'Nr: ' + numerStartowy +  '  Nazwa: ' + horse.nazwa + '  Hodowca: ' + horse.hodowca + '</option>');	
				horsesRight = _.without(horsesRight, _.findWhere(horsesRight, {id: horse.id}));
				var horseNumb = {id:horse.id, nr:numerStartowy, nazwa:horse.nazwa, hodowca:horse.hodowca};
				horsesRight.push(horseNumb);
				console.log(horseNumb);
				numerStartowy += 1;
			});			
            $('#horseLeftSelectList').append('<option id="' + id + '" nazwa="' + nazwa + '" hodowca="' + hodowca + '">' + '  Nazwa: ' + nazwa + '  Hodowca: ' + hodowca + '</option>');
            var horse = {id:id, nazwa:nazwa, hodowca:hodowca};
            horsesLeft.push(horse);
			console.log('HorsesLeft: ' + horsesLeft.length + ' Right: ' + horsesRight.length);
		}  
});

var addGroupFunc = function(idCompetition){
	idCompetitionFromTable = idCompetition;
	hideAll();
	addGroup.style.display = 'block';	
	loadAllHorsesToLeftTable();
};

var loadLeftOptions = function(){
	var horseAvailableList = "";
	horsesLeft.forEach(function(horse){
		horseAvailableList += '<option id="' + horse.id + '" nazwa="' + horse.nazwa + '" hodowca="' + horse.hodowca + '" >' + 'Nazwa: ' + horse.nazwa + '  Hodowca: ' + horse.hodowca + '</option>';
	});
	horseLeftSelect.innerHTML = horseAvailableList;
};

var loadAllHorsesToLeftTable = function(){
	socket.emit('get horses');
    socket.on('get horses', function (horses) {		
		horsesLeft = [];
        horses.forEach(function (horse) {
            var oneHorse = {id:horse._id, nazwa:horse.nazwa, hodowca:horse.hodowca};
            horsesLeft.push(oneHorse);
        });
		loadLeftOptions();
	});
};

// Dodawanie Zawodów -----------------------------------------------------------------
cancelAddCompetition.addEventListener('click', function(){
	hideAllShowHome();	
});

addCompetitionButt.addEventListener('click', function(){
    var nazwa = $('#nazwaZawodow').val();
    var ocena = $('#ocena').val();
	var liczbasedziow = $('#liczbaSedziow').val();
	socket.emit('judges count');
	socket.on('judges counted', function (number) {
		var liczbasedziowInt = parseInt(liczbasedziow);
		if(liczbasedziowInt <= number){
			socket.emit('add competition',
				{
					nazwa: nazwa,
					ocena: ocena,
					liczbasedziow: liczbasedziow
				}
			);
			liczbasedziow = "";
			hideAllShowHome();
			refreshComp();
		}else{
			error.style.display = 'block';
			errorMessage.innerHTML = "Jest tylko " + number + " sedziow.";
		}		
	});			
});

listAddCompetition.addEventListener('click', function(){
	addCompetition.style.display = 'block';
	home.style.display = 'none';
});

var refreshComp = function(){
	socket.emit('get competitions');
	socket.on('get competitions', function (list) {
		cTable.clear();
		list.forEach(function (list) {
            var data =[ list.nazwa, list.ocena, list.liczbasedziow,' ',' ','<button class="delete-' + list._id + '">Usuń</button>','<button class="groups-' + list._id + '">Grupy</button>','<button class="addgroup-' + list._id + '">Dodaj Grupe</button>'];
			data.id = list._id;
            cTable.row.add(data).draw();
			$('.delete-'+list._id).click(function(){
                console.log('remove competition: ' + list._id);
                socket.emit('remove competition', { id: list._id });
                refreshComp();
            });
			$('.addgroup-'+list._id).click(function(){
				compId = list._id;
                addGroupFunc(list._id);
            });
			$('.groups-'+list._id).click(function(){
                showGroupsFunc(list._id, list.nazwa);
            });
		});
	});
};

// Ukrywanie i ładowanie okien -----------------------------------------------------------------
var hideAll = function(){
	error.style.display = 'none';
	addCompetition.style.display = 'none';
	addGroup.style.display = 'none';
	home.style.display = 'none';
	showGroupsWindow.style.display = 'none';
};

var hideAllShowHome = function(){
	hideAll();
	home.style.display = 'block';
};

window.onload = function() {
	hideAllShowHome();
	refreshComp();
};	