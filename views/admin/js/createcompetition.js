/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var socket = io();
var addCompetitionButt = document.getElementById('addCompetitionButt');
var addCompetition = document.getElementById('addCompetition');
var listAddCompetition = document.getElementById('listAddCompetition');
var errorMessage = document.getElementById('errorMessage');
var error = document.getElementById('error');
var home = document.getElementById('home');
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
			error.style.display = 'none';
			addCompetition.style.display = 'none';
			home.style.display = 'block';
			refresh();
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



var refresh = function(){
	socket.emit('get competitions');
	socket.on('get competitions', function (list) {
		$('#compbody').empty();
		cTable.clear();
		list.forEach(function (list) {
            var data =[ list.nazwa, list.ocena, list.liczbasedziow,' ',' ','<button class="delete-' + list._id + '">Usuń</button>','<button class="groups-' + list._id + '">Grupy</button>','<button class="addgroup-' + list._id + '">Dodaj Grupe</button>'];
			data.id = list._id;
            cTable.row.add(data).draw();
			$('.delete-'+list._id).click(function(){
                console.log('remove competition: ' + list._id);
                socket.emit('remove competition', { id: list._id });
                refresh();
            });
		});
	});
};
			  
window.onload = function() {
	error.style.display = 'none';
	addCompetition.style.display = 'none';
	//element.style.display = 'none';          
	//element.style.display = 'block'; 
    refresh();
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