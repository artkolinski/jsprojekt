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

// Dodawanie Grupy -----------------------------------------------------------------
var horsesLeft = [];
var horsesRight = [];
var numerStartowy = 0;
cancelAddGroup.addEventListener('click', function(){
	hideAllShowHome();	
});

addGroupButt.addEventListener('click', function(){
	//TODO przycisk dodający grupe
});


fromLeftToRight.addEventListener('click', function(){
        var id = $("#horseLeftSelectList option:selected").attr('id');
        var nazwa = $("#horseLeftSelectList option:selected").attr('nazwa');
        var hodowca = $("#horseLeftSelectList option:selected").attr('hodowca');
        if(typeof id != 'undefined') { 
            console.log(nazwa + " ->");
            $("#horseLeftSelectList option:selected").remove();
			numerStartowy += 1;
            $('#horseRightSelectList').append('<option id="' + id + '" nazwa="' + nazwa + '" hodowca="' + hodowca + '">' + 'Nr: ' + numerStartowy +  '  Nazwa: ' + nazwa + '  Hodowca: ' + hodowca + '</option>');
            var horse = {id:id, nazwa:nazwa, hodowca:hodowca};
			horsesLeft = _.without(horsesLeft, _.findWhere(horsesLeft, {id: id}));
            horsesRight.push(horse);
			console.log('HorsesLeft: ' + horsesLeft.length + ' Right: ' + horsesRight.length);
		}  
});

fromRightToLeft.addEventListener('click', function(){
	 	var id = $("#horseRightSelectList option:selected").attr('id');
        var nazwa = $("#horseRightSelectList option:selected").attr('nazwa');
        var hodowca = $("#horseRightSelectList option:selected").attr('hodowca');
        if(typeof id != 'undefined') { 
            console.log(nazwa + " <-");
            //$("#horseRightSelectList option:selected").remove();
			$("#horseRightSelectList").remove();
            $('#horseLeftSelectList').append('<option id="' + id + '" nazwa="' + nazwa + '" hodowca="' + hodowca + '">' + '  Nazwa: ' + nazwa + '  Hodowca: ' + hodowca + '</option>');
            var horse = {id:id, nazwa:nazwa, hodowca:hodowca};
			numerStartowy -= 1;
			//TODO Usunięcie z prawej tablicy

            horsesLeft.push(horse);
			console.log('HorsesLeft: ' + horsesLeft.length + ' Right: ' + horsesRight.length);
		}  
});

var addGroupFunc = function(idCompetition){
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
                addGroupFunc(list._id);
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
};

var hideAllShowHome = function(){
	hideAll();
	home.style.display = 'block';
};

window.onload = function() {
	hideAllShowHome();
	refreshComp();
};	

/*
var refresh = function(){
    console.log('get horses');
    socket.emit('get horses');
    socket.on('get horses', function (horses) {
       $('#tbody').empty();
        hTable.clear();
        horses.forEach(function (horse) {
            var data =[ horse.nazwa, horse.plec, horse.dataur, horse.hodowca,'<button class="modify-' + horse._id + '">Edycja</button>','<button class="delete-' + horse._id + '">Usuń</button>'];
            data.id = horse._id;
            hTable.row.add(data).draw();
            $('.modify-'+horse._id).click(function(){
                $('#horse').css("visibility", "hidden");
                
                var site = '<div id="editForm">';
                site += '<table class="table table-bordered table-striped"><tr><th>Nazwa</th><th>Płeć</th><th>Data urodzin</th><th>Hodowca</th><th></th><th></th></tr>';
                site += '<tr><th><input id="editNazwa" value='+horse.nazwa+' /></td></th></br>';
                if(horse.plec == "Klacz"){
                    site += '<th><select id="editPlec"><option value="Klacz" selected>Klacz</option><option value="Koń">Koń</option></select></td></th></br>';
                }else{
                    site += '<th><select id="editPlec"><option value="Klacz">Klacz</option><option value="Koń" selected>Koń</option></select></td></th></br>';
                }
				site += '<td><input type="date" id="editDataur" value='+horse.dataur+' /></td>';
                site += '<th><input id="editHodowca" value='+horse.hodowca+' /></td></th></br>';
                site += '<th><button id="editOk">Edytuj</button></th>';
                site += '<th><button id="editCancel">Anuluj</button></th></tr>';
                site += '</table></div>';
                $('#editHorse').append(site);

                var editForm = document.getElementById('editForm');
                var editOk = document.getElementById('editOk');
                var editCancel = document.getElementById('editCancel');

                editOk.addEventListener('click', function () {
                    console.log('update horse: ' + horse._id);
                    socket.emit('update horse', {
                        id: horse._id,
                        nazwa: $('#editNazwa').val(),
                        plec: $('#editPlec').val(),
						dataur: $('#editDataur').val(),
                        hodowca: $('#editHodowca').val()
                    });
                    editForm.remove();
                    $('#horse').css("visibility", "visible");
                    refresh();
                });

                editCancel.addEventListener('click', function(){
                    editForm.remove();
                    $('#horse').css("visibility", "visible");
                });
            });

            $('.delete-'+horse._id).click(function(){
                console.log('remove horse: ' + horse._id);
                socket.emit('remove horse', { id: horse._id });
                refresh();
            });
        });
    });
};

window.onload = function() {
    refresh();
};

addHorse.addEventListener('click', function(){
    var nazwa = $('#nazwa').val();
    var plec = $('#plec').val();
	var dataur = $('#dataur').val();
    var hodowca = $('#hodowca').val();
    socket.emit('add horse',
        {
            nazwa: nazwa,
            plec: plec,
			dataur: dataur,
            hodowca: hodowca
        }
    );
    refresh();
});*/