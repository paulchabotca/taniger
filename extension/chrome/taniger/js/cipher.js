var Cipher = {
	encrypt: function(text, key, algorithm) {
		switch (parseInt(algorithm)) {
			case 1:		// Triple DES
				text = CryptoJS.TripleDES.encrypt(text, key);
				break;
			case 2:		// AES
				text = CryptoJS.AES.encrypt(text, key);
				break;
			case 4:		// DES
				text = CryptoJS.DES.encrypt(text, key);
				break;
			case 8:		// RC4
				text = CryptoJS.RC4.encrypt(text, key);
				break;
			case 16:	// Rabbit
				text = CryptoJS.Rabbit.encrypt(text, key);
				break;
			default:
				break;
		}
		
		return text;
	},
	
	decrypt: function(text, key, algorithm) {
		switch (parseInt(algorithm)) {
			case 1:		// Triple DES
				text = CryptoJS.TripleDES.decrypt(text, key);
				break;
			case 2:		// AES
				text = CryptoJS.AES.decrypt(text, key);
				break;
			case 4:		// DES
				text = CryptoJS.DES.decrypt(text, key);
				break;
			case 8:		// RC4
				text = CryptoJS.RC4.decrypt(text, key);
				break;
			case 16:	// Rabbit
				text = CryptoJS.Rabbit.decrypt(text, key);
				break;
			default:
				break;
		}
		
		return CryptoJS.enc.Utf8.stringify(text);
	}
};