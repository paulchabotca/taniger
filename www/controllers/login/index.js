$(document).ready(function() {
	$('#password').focus();
	
	$('form').submit(function(e) {
		return tanapp.checkLoginForm();
	});
	
	$('#logout').click(function() {
		window.location = '/logout';
	});
});