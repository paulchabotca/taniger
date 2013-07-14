<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	// Check if this a facebook login redirect.
	if ($this->facebook->facebookLogin() && !$this->facebook->confirmIdentity()) { $this->redirect('/logout'); }
	
	// Check if the user is logged in to the actual website (the 2nd layer of security)
	if ($this->facebook->is_logged() && !$this->auth->logged()) {
		$this->auth->loginOrRegister();
	}
	
	$this->addJS(__FILE__, 'index');
	$this->render(__FILE__, 'view');