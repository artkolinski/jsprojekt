/* jshint browser: true, devel: true, jquery: true, esnext: true, node: true   */
/* global io: false */
var socket = io();

// Informacje -----------------------------------------------------------------
var infoWindow = document.getElementById('infoWindow');
var infoMessage = document.getElementById('infoMessage');
var infoMessage2 = document.getElementById('infoMessage2');
var infoMessage3 = document.getElementById('infoMessage3');

// Punktacje -----------------------------------------------------------------
var Window10 = document.getElementById('Window10');
var SliderSpace = document.getElementById('SliderSpace');
//var Window105 = document.getElementById('Window105');
//var Window20 = document.getElementById('Window20');
//var Window205 = document.getElementById('Window205');

// Window10 -----------------------------------------------------------------
var typeSlider10 = document.getElementById('typeSlider10');
var headSlider10 = document.getElementById('headSlider10');
var klodaSlider10 = document.getElementById('klodaSlider10');
var legsSlider10 = document.getElementById('legsSlider10');
var movementSlider10 = document.getElementById('movementSlider10');
var vote10 = document.getElementById('vote10');
var judgeID = document.getElementById('judgeID');
//var  = document.getElementById('');

// Glowne okno -----------------------------------------------------------------
var votingWindow = document.getElementById('votingWindow');
var fastReminder = document.getElementById('fastReminder');
var horseTable = $('#horseTable').DataTable({
    "columnDefs": [ {
    "targets": [3],
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

// Wejscie sedziego ------------------------------------------------
//var judgeId = "574984e5068effa002ce5b5fss";
var judgeId = "";
var connected = false;
var votingHorseId = "";
var horsesToVote = [];

var searchHorsesToVote = function(){
	socket.on('fastReminder', function(reminderIdJudge){
		if(reminderIdJudge == judgeId){
			console.log('fastReminder Activate');
			fastReminder.style.display = 'block';
		}
	});		  
	socket.emit('judge connected', judgeId);
	console.log('idSedziego:' + judgeId);
	if(connected === false){
		socket.on('judge connected', function(data){ // objGrupa, ratingsType
			var data2 = {horseTable:data.objGrupa.listastartowa, judgeId:judgeId};
			generateSliders(data.ratingsType);
			socket.emit('get horse table', data2);
			//var connected = true;
		});
		setTimeout(function() {
			
			socket.on('get horse table', function(data){ //horseTable,votedHorses - sameID
				data.horseTable.forEach(function(oneHorse){
					console.log('one Horse = ' + oneHorse);
					var add = true;
					if(data.votedHorses !== undefined){
						data.votedHorses.forEach(function(oneVote){
							if(oneHorse._id == oneVote){
								add = false; 
							}
						});
					}
					if(add === true){
						horsesToVote.push(oneHorse);
					}
				});

				setTimeout(function() {
					loadHorseTable();
				},300);
			});
		},300);
	}	
};
var loadHorseTable = function(){
		horseTable.clear();
		horsesToVote.forEach(function (list) {
            var data =[ list.nazwa, list.dataur, list.hodowca,'<button class="vote-' + list._id + '">Oceń</button>'];
			data.id = list._id;
            horseTable.row.add(data).draw();
			$('.vote-'+list._id).click(function(){
                console.log('voting on: ' + list._id + " , " + list.nazwa);
				hideAll();
				Window10.style.display = 'block';
				$('#horseInfoForVote').text("Koń: " + list.nazwa + ", Hodowca: " + list.hodowca);
				votingHorseId = list._id;
            });
		});
};

var generateSliders = function(type){ //10,105,20,205
	console.log('start generating sliders type: ' + type);
	var slidersHtml = "";
	var max = 10;
	var step = 1;
	if(type == 105){
		max = 10;
		step = 0.5;
	}else{
		if(type == 20){
			max = 20;
			step = 1;
		}else{
			if(type == 205){
				max = 20;
				step = 0.5;
			}else{
				// 10
				max = 10;
				step = 1;
			}
		}
	}
	
	slidersHtml += "<h3>Typ: <div id='type10' >10</div></h3>";
	slidersHtml += "<input id='typeSlider10' data-slider-id='ex1Slider' type='text' data-slider-min='0' data-slider-max=" +max+" data-slider-step="+step+" data-slider-value='10'/>";	

	slidersHtml += "<h3>Głowa i szyja: <div id='head10' >9</div></h3>";
	slidersHtml += "<input id='headSlider10' data-slider-id='ex1Slider' type='text' data-slider-min='0' data-slider-max="+max+" data-slider-step="+step+" data-slider-value='9'/>";

	slidersHtml += "<h3>Kłoda: <div id='kloda10' >8</div></h3>";
	slidersHtml += "<input id='klodaSlider10' data-slider-id='ex1Slider' type='text' data-slider-min='0' data-slider-max="+max+" data-slider-step="+step+" data-slider-value='8'/>";

	slidersHtml += "<h3>Nogi: <div id='legs10' >7</div></h3>";
	slidersHtml += "<input id='legsSlider10' data-slider-id='ex1Slider' type='text' data-slider-min='0' data-slider-max="+max+" data-slider-step="+step+" data-slider-value='7'/>";

	slidersHtml += "<h3>Ruch: <div id='movement10' >6</div></h3>";
	slidersHtml += "<input id='movementSlider10' data-slider-id='ex1Slider' type='text' data-slider-min='0' data-slider-max="+max+" data-slider-step="+step+" data-slider-value='6'/>";
	$('#SliderSpace').append(slidersHtml);
	//document.getElementById('SliderSpace').append(slidersHtml);
	
	// Obsługa Sliderow -----------------------------------------------------------------
	$('#typeSlider10').slider({
		formatter: function(value) {
			$('#type10').text($('#typeSlider10').val());
			return 'Aktualna wartość: ' + value;
		}
	});

	$('#headSlider10').slider({
		formatter: function(value) {
			$('#head10').text($('#headSlider10').val());
			return 'Aktualna wartość: ' + value;
		}
	});

	$('#klodaSlider10').slider({
		formatter: function(value) {
			$('#kloda10').text($('#klodaSlider10').val());
			return 'Aktualna wartość: ' + value;
		}
	});

	$('#legsSlider10').slider({
		formatter: function(value) {
			$('#legs10').text($('#legsSlider10').val());
			return 'Aktualna wartość: ' + value;
		}
	});

	$('#movementSlider10').slider({
		formatter: function(value) {
			$('#movement10').text($('#movementSlider10').val());
			return 'Aktualna wartość: ' + value;
		}
	});
	
	vote10.addEventListener('click', function(){
		var ocena = {
			typ:$('#typeSlider10').val(), 
			glowa:$('#headSlider10').val(), 
			kloda:$('#klodaSlider10').val(), 
			nogi:$('#legsSlider10').val(), 
			ruch:$('#movementSlider10').val(), 
			idHorse:votingHorseId, 
			idJudge:judgeId
		};
		socket.emit('create ocena_sedziego', ocena);
		console.log('tab horsesToVote[0]: '+ horsesToVote[0]._id);
		console.log('tab horsesToVote[0]: '+ horsesToVote[0].nazwa);
		hideAllShowVotingWindow();
		setTimeout(function() {
			location.reload();
		},250);
	});

	$('#type10').text("10");
	$('#head10').text("9");
	$('#kloda10').text("8");
	$('#legs10').text("7");
	$('#movement10').text("6");
	
};

// Ukrywanie i ładowanie okien ------------------------------------------------
var hideAll = function(){
	infoWindow.style.display = 'none';
	Window10.style.display = 'none';
	//Window105.style.display = 'none';
	//Window20.style.display = 'none';
	//Window205.style.display = 'none';
	votingWindow.style.display = 'none';
	judgeID.style.display = 'none';
	fastReminder.style.display = 'none';
};

var hideAllShowVotingWindow = function(){
	hideAll();
	votingWindow.style.display = 'block';
	judgeId = $('#idJudge').val();
};

window.onload = function() {
	hideAllShowVotingWindow();
	searchHorsesToVote();
};	