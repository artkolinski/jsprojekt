/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var socket = io();
var hTable = $('#accTab').DataTable({
    "columnDefs": [ {
    "targets": [4,5],
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

var refresh = function(){
    console.log('get accounts');
    socket.emit('get accounts');
    socket.on('get accounts', function (account) {
       $('#tbody').empty();
        hTable.clear();
        account.forEach(function (account) {
            var data =[account.username, account.imie, account.nazwisko, account.role,'<button class="modify-' + account._id + '">Edycja</button>','<button class="delete-' + account._id + '">Usuń</button>'];
            data.id = account._id;
            hTable.row.add(data).draw();
            $('.modify-'+account._id).click(function(){
                $('#horse').css("visibility", "hidden");
                var site = '<div id="editForm">';
                site += '<table class="table table-bordered table-striped"><tr><th>Username</th><th>Imie</th><th>Nazwisko</th><th>Uprawnienia</th><th></th><th></th></tr>';
                site += '<tr><th><input id="editUsername" value='+account.username+' /></td></th></br>';
				site += '<th><input id="editImie" value="'+account.imie+'" /></td></th></br>';
                site += '<th><input id="editNazwisko" value="'+account.nazwisko+'" /></td></th></br>';
                if(account.role == "admin"){
                    site += '<th><select id="editRole"><option value="admin" selected>admin</option><option value="sedzia">sedzia</option></select></th></br>';  
                }else{
                    site += '<th><select id="editRole"><option value="admin">admin</option><option value="sedzia" selected>sedzia</option></select></th></br>';   
                }                
                site += '<th><button id="editOk">Edytuj</button></th>';
                site += '<th><button id="editCancel">Anuluj</button></th></tr>';
                site += '</table></div>';
                $('#editHorse').append(site);

                var editForm = document.getElementById('editForm');
                var editOk = document.getElementById('editOk');
                var editCancel = document.getElementById('editCancel');

                editOk.addEventListener('click', function () {
                    console.log('update account: ' + account._id);
                    socket.emit('update account', {
                        id: account._id,
                        username: $('#editUsername').val(),
						imie: $('#editImie').val(),
                        nazwisko: $('#editNazwisko').val(),
                        role: $('#editRole').val()
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

            $('.delete-'+account._id).click(function(){
                console.log('remove account: ' + account._id);
                socket.emit('remove account', { id: account._id });
                refresh();
            });
        });
    });
};

window.onload = function() {
    refresh();
};