$(document).ready(function() {
	$('#new').focus();
	
	$('form').submit(function(e) {
		return tanapp.checkResetPasswordForm();
	});
});