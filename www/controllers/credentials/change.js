$(document).ready(function() {
	$('#current').focus();
	
	$('form').submit(function(e) {
		return tanapp.checkChangePasswordForm();
	});
});