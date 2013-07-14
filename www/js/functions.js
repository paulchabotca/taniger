var tanapp = {
	min_password: 8,
	
	checkRegisterForm: function() {
		var e = $.trim($('#email').val() + '');
		var p = $.trim($('#password').val() + '');
		var c = $.trim($('#confirm').val() + '');
		
		if (e.length == 0 || !this.isValidEmail(e)) {
			alert('Please enter an e-mail address');
			$('#email').focus();
			return false;
		} else if (p.length < this.min_password) {
			alert('Your password must be at least '+ this.min_password +' characters long');
			$('#password').focus();
			return false;
		} else if (p != c) {
			alert('Your passwords do not match!');
			$('#password').focus();
			return false;
		}
		
		return true;
	},
	
	checkLoginForm: function() {
		var p = $.trim($('#password').val() + '');
		
		if (p.length == 0) {
			alert('Please enter your password');
			$('#password').focus();
			return false;
		}
		
		return true;
	},
	
	isValidEmail: function(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	
	unavailableExtension: function() {
		alert('The extension for this browser is not available');
	},
	
	checkChangePasswordForm: function() {
		var o = $.trim($('#current').val() + '');
		var n = $.trim($('#new').val() + '');
		var c = $.trim($('#confirm').val() + '');
		
		if (o.length == 0) {
			alert('Please enter your current password');
			$('#current').focus();
			return false;
		} else if (n.length < this.min_password) {
			alert('Your password must be at least '+ this.min_password +' characters long');
			$('#new').focus();
			return false;
		} else if (n != c) {
			alert('Your passwords do not match!');
			$('#new').focus();
			return false;
		}
		
		return true;
	},
	
	checkResetPasswordForm: function() {
		var n = $.trim($('#new').val() + '');
		var c = $.trim($('#confirm').val() + '');
		
		if (n.length < this.min_password) {
			alert('Your password must be at least '+ this.min_password +' characters long');
			$('#new').focus();
			return false;
		} else if (n != c) {
			alert('Your passwords do not match!');
			$('#new').focus();
			return false;
		}
		
		return true;
	}
};