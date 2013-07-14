<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	session_destroy();
	
	if ($this->params['_route'] == 'login') {
		$this->redirect('https://www.facebook.com/dialog/oauth?client_id=' . FACEBOOK_APP_ID . '&redirect_uri=' . BASE);
	}
	$this->redirect('/index');