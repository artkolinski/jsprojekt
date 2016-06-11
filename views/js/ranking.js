/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var socket = io();

// Glowne okno -----------------------------------------------------------------
var rankingTable = $('#rankingTable').DataTable({
    "iDisplayLength": -1,
    "aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
	"order": [[ 1, "desc" ]]
});

// Wejscie widza ------------------------------------------------

var loadRankingTable = function(){
	socket.emit('get ranking');
	socket.on('get ranking', function(tabelaWynikow){
			loadVotesTable(tabelaWynikow);
		});
};

var loadVotesTable = function(tabelaWynikow){
	//typ,glowa:,kloda:,nogi:,ruch:,nazwaKonia:
		rankingTable.clear();
		tabelaWynikow.forEach(function (list) {
			var srednia = 
				(list.typ + 
				list.glowa +
				list.kloda +
				list.nogi +
				list.ruch) / 5;
            var data =[ 
				list.nazwaKonia, 
				srednia, 
				list.typ,
				list.glowa,
				list.kloda,
				list.nogi,
				list.ruch
			];
            rankingTable.row.add(data).draw();
		});
};

// Ukrywanie i ładowanie okien ------------------------------------------------

window.onload = function() {	
	loadRankingTable();
};	