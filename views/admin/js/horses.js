/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var addHorse = document.getElementById('addHorse');
var socket = io();
var hTable = $('#horseTab').DataTable({
    "columnDefs": [ {
    "targets": [3,4],
    "orderable": false
    } ],
    "iDisplayLength": 10,
    "aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
    "createdRow" : function( row, data, index ) {
        if( data.hasOwnProperty("id") ) {
            row.id = data.id;
        }       
    }
});

var refresh = function(){
    console.log('get horses');
    socket.emit('get horses');
    socket.on('get horses', function (horses) {
       $('#tbody').empty();
        hTable.clear();
        horses.forEach(function (horse) {
            var data =[horse.nazwa,horse.plec, horse.hodowca,'<button class="modify-' + horse._id + '">Edycja</button>','<button class="delete-' + horse._id + '">Usuń</button>'];
            data.id = horse._id;
            hTable.row.add(data).draw();
            $('.modify-'+horse._id).click(function(){
                $('#horse').css("visibility", "hidden");
                
                var site = '<div id="editForm">';
                site += '<table class="table table-bordered table-striped"><tr><th>Nazwa</th><th>Płeć</th><th>Hodowca</th><th></th><th></th></tr>';
                site += '<tr><th><input id="editNazwa" value='+horse.nazwa+' /></td></th></br>';
                site += '<th><select id="editPlec"><option value="Klacz">Klacz</option><option value="Koń">Koń</option></select></td></th></br>';
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
    var hodowca = $('#hodowca').val();
    socket.emit('add horse',
        {
            nazwa: nazwa,
            plec: plec,
            hodowca: hodowca
        }
    );
    refresh();
});