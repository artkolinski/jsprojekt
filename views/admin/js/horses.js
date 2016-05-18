/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var addHorse = document.getElementById('addHorse');
var socket = io();
var refresh = function(){
    console.log('get horses');
    socket.emit('get horses');
    socket.on('get horses', function (horses) {
        $('.horseRow').remove();
        horses.forEach(function (horse) {
            $('#horseTab').append('<tr id="' + horse._id + '" class="horseRow"><td>' + horse.nazwa + '</td><td>' + horse.plec + '</td><td>' + horse.hodowca + '</td><td><button class="modifyHorse">Edycja</button></td><td><button class="deleteHorse">Usuń</button></td></tr>');
            $('.modifyHorse:last').click(function(){
                $('#horse').css("visibility", "hidden");
                
                var site = '<div id="editForm">';
                site += 'Nazwa: <input id="editNazwa" value='+horse.nazwa+' /></td></br>';
                site += 'Plec: <select id="editPlec"><option value="Klacz">Klacz</option><option value="Koń">Koń</option></select></td></br>';
                site += 'Hodowca: <input id="editHodowca" value='+horse.hodowca+' /></td></br>';
                site += '<button id="editOk">Edytuj</button>';
                site += '<button id="editCancel">Anuluj</button></br>';
                site += '</div>';
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

            $('.deleteHorse:last').click(function(){
                var id = $(this).parent().parent().prop('id');
                console.log('remove horse: ' + id);
                socket.emit('remove horse', { id: id });
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