<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	/*
		TANIGER CONFIG FILE.
		SEARCH FOR %%EDIT_THIS%%
	*/
	
	// Runmode.
	define('RUNMODE', 'PRODUCTION');
	
	// Web site's version
	define('VERSION', '0.1.0');
	
	// Extension's versions.
	define('VERSION_CHROME', '0.0.1');
	define('DOWNLOAD_URL_CHROME', '%%EDIT_THIS%%');
	
	// Database settings
	define('DB_HOST', '%%EDIT_THIS%%');
	define('DB_USER', '%%EDIT_THIS%%');
	define('DB_PASS', '%%EDIT_THIS%%');
	define('DB_NAME', '%%EDIT_THIS%%');
	
	// The domain name: Format: 'www.taniger.com'
	// No 'http' or slashes.
	define('DOMAIN', '%%EDIT_THIS%%');
	// Is is HTTPS?
	define('HTTPS', true);
	
	// Don't touch this
	if (HTTPS) {
		define('BASE', 'https://' . DOMAIN . '/');
	} else {
		define('BASE', 'http://' . DOMAIN . '/');
	}
	
	// unix path
	define('PATH', dirname(__FILE__) . '/');
	
	// Will you keep logs?
	define('STATS', true);
	
	// Some e-mail options
	define('NO_REPLY_MAIL', '%%EDIT_THIS%%');	// something like noreply@taniger.com
	define('MAIL_FROM', '%%EDIT_THIS%%');	// something like TANIGER TEAM Support
	
	// Default timezone
	date_default_timezone_set('Europe/Athens');
	
	// Facebook application keys
	define('FACEBOOK_APP_ID', '%%EDIT_THIS%%');
	define('FACEBOOK_APP_SECRET_ID', '%%EDIT_THIS%%');
	
	// And some other options.
	define('MIN_PASSWORD_LENGTH', 8);
	define('PASSWORD_SALT', '%%EDIT_THIS%%'); // Any random key will do. Example: 'D209CBNWOIBCibw0pb0qpb08B8b32052HiahbdA'
	define('KEY_CHARACTER_SET', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()~[]|}{;?,._');
	
	// Don't touch this unless you know what you are doing.
	switch(RUNMODE) {
		case 'DEVELOPMENT':
			ini_set('error_reporting', E_ALL | E_STRICT);
			ini_set('display_errors', 'on');
			
			break;
		case 'PRODUCTION':
			ini_set('display_errors', 'off');
			break;
	}