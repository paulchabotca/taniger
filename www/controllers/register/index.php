<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	// Allow access only if user is logged to facebook.
	if (!$this->facebook->is_logged()) { $this->redirect('/index'); }
	// If user is logged send him to the index.
	if ($this->auth->logged()) { $this->redirect('/index'); }
	// If user has an account redirect him to the login
	if ($this->auth->user_exists()) { $this->redirect('/login'); }
	
	// Form processing
	if (isset($_POST['submit'])) {
		$e = isset($_POST['email']) ? trim($_POST['email']) : '';
		$p = isset($_POST['password']) ? trim($_POST['password']) : '';
		$c = isset($_POST['confirm']) ? trim($_POST['confirm']) : '';
		
		if (empty($e) || !$this->isValidEmail($e)) {
			$this->redirect('/register/show/error/' . urlencode('Please enter a valid e-mail address'));
		} else if (strlen($p) < MIN_PASSWORD_LENGTH || $p != $c) {
			$this->redirect('/register/show/error/' . urlencode('Please enter a valid password'));
		}
		
		if (!$this->auth->createUser($e, $p, true)) {
			$this->redirect('/register/show/error/' . urlencode('Could not create your account. Please try again.'));
		}
		$this->redirect('/index');
	}
	
	$this->addJS(__FILE__, 'index');
	$this->render(__FILE__, 'view');