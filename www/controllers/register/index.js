$(document).ready(function() {
	$('#email').focus();
	
	$('form').submit(function(e) {
		return tanapp.checkRegisterForm();
	});
	
	$('#logout').click(function() {
		window.location = '/logout';
	});
});