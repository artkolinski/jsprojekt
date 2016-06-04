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
var Window105 = document.getElementById('Window105');
var Window20 = document.getElementById('Window20');
var Window205 = document.getElementById('Window205');

// Window10 -----------------------------------------------------------------
var typeSlider10 = document.getElementById('typeSlider10');
var headSlider10 = document.getElementById('headSlider10');
var klodaSlider10 = document.getElementById('klodaSlider10');
var legsSlider10 = document.getElementById('legsSlider10');
var movementSlider10 = document.getElementById('movementSlider10');
var vote10 = document.getElementById('vote10');
//var  = document.getElementById('');

// Glowne okno -----------------------------------------------------------------
var votingWindow = document.getElementById('votingWindow');

// Obsługa live sliderow -----------------------------------------------------------------
typeSlider10.addEventListener('input', function () {
            $('#type10').text($('#typeSlider10').val());
});
headSlider10.addEventListener('input', function () {
            $('#head10').text($('#headSlider10').val());
});
klodaSlider10.addEventListener('input', function () {
            $('#kloda10').text($('#klodaSlider10').val());
});
legsSlider10.addEventListener('input', function () {
            $('#legs10').text($('#legsSlider10').val());
});
movementSlider10.addEventListener('input', function () {
            $('#movement10').text($('#movementSlider10').val());
});



// Ukrywanie i ładowanie okien ------------------------------------------------
var hideAll = function(){
	infoWindow.style.display = 'none';
	Window10.style.display = 'none';
	Window105.style.display = 'none';
	Window20.style.display = 'none';
	Window205.style.display = 'none';
	votingWindow.style.display = 'none';
};

var hideAllShowVotingWindow = function(){
	hideAll();
	votingWindow.style.display = 'block';
	Window10.style.display = 'block';
};

window.onload = function() {
	hideAllShowVotingWindow();
	//refreshComp();
};	