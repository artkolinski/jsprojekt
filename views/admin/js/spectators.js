/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var socket = io();

// Glowne okno -----------------------------------------------------------------
var votingWindow = document.getElementById('votingWindow');
var votesTable = $('#votesTable').DataTable({
    "iDisplayLength": -1,
    "aLengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
});

// Wejscie widza ------------------------------------------------

var loadVotes = function(){
	socket.emit('get votes');
	socket.on('refresh votes', function(tabelaWynikow){
		//typ,glowa:,kloda:,nogi:,ruch:,nazwaKonia:,nazwiskoSedziego:
			/*console.log('Votes dl: '+tabelaWynikow.length);
			console.log('Votes[0].typ: '+tabelaWynikow[0].typ);
			console.log('Votes[0].kon: '+tabelaWynikow[0].nazwaKonia);
			console.log('Votes[0].sedzia: '+tabelaWynikow[0].nazwiskoSedziego);
			console.log('----------');
			console.log('Votes[1].typ: '+tabelaWynikow[1].typ);
			console.log('Votes[1].kon: '+tabelaWynikow[1].nazwaKonia);
			console.log('Votes[1].sedzia: '+tabelaWynikow[1].nazwiskoSedziego);*/
			loadVotesTable(tabelaWynikow);
		});
};

var loadVotesTable = function(tabelaWynikow){
	//typ,glowa:,kloda:,nogi:,ruch:,nazwaKonia:,nazwiskoSedziego:
		votesTable.clear();
		tabelaWynikow.forEach(function (list) {
            var data =[ 
				list.nazwaKonia, 
				list.nazwiskoSedziego, 
				list.typ,
				list.glowa,
				list.kloda,
				list.nogi,
				list.ruch
			];
            votesTable.row.add(data).draw();
		});
};

// Ukrywanie i ładowanie okien ------------------------------------------------

window.onload = function() {	
	loadVotes();
};	