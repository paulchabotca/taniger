<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	// Allow access only if user is logged to facebook.
	if (!$this->facebook->is_logged()) { $this->redirect('/index'); }
	// If user is logged send him to the index.
	if ($this->auth->logged()) { $this->redirect('/index'); }
	// If user has an account redirect him to the register
	if (!$this->auth->user_exists()) { $this->redirect('/register'); }
	
	if ($this->params['_route'] == 'recover') {
		// Password recovery
		
		$sql = "SELECT email FROM users WHERE id = '". $this->db->escape($this->facebook->get_facebook_id()) ."' LIMIT 1";
		$res = $this->db->query($sql);
		if (!$res || $this->db->rows($res) == 0) {
			$this->redirect('/show/error/message/' . urlencode('E-Mail not found.'));
		}
		$row = $this->db->fetch($res);
		$to = $row['email'];
		
		$body = file_get_contents(dirname(__FILE__) . '/recover.html');
		
		$validation = md5(time() . $this->facebook->get_facebook_id() . $this->facebook->get_facebook_full_name());
		
		$sql = "UPDATE users SET validation = '". $validation ."' WHERE id = '". $this->db->escape($this->facebook->get_facebook_id()) ."' LIMIT 1";
		$res = $this->db->query($sql);
		if (!$res) {
			$this->redirect('/show/error/message/' . urlencode('Could not initiate recovery process.'));
		}
		
		$body = str_replace('%URL%', BASE . 'credentials/recover/key/'. $validation .'/user/' . $this->facebook->get_facebook_id(), $body);
		
		require_once(PATH . 'sys/class.phpmailer.php');
		
		$mail = new PHPMailer();
		$mail->SetFrom(NO_REPLY_MAIL, MAIL_FROM);
		$mail->AddAddress($to, $this->facebook->get_facebook_full_name());
		$mail->Subject = 'TANIGER Password Recovery';
		$mail->IsHTML(true);
		$mail->Body = $body;
		
		if (!$mail->Send()) {
			$this->redirect('/show/error/message/' . urlencode('Could not send e-mail.'));
		}
	} else{
		// Form processing
		if (isset($_POST['submit'])) {
			$p = isset($_POST['password']) ? trim($_POST['password']) : '';
			
			if ($this->auth->login($p)) { $this->redirect('/index'); }
			$this->redirect('/login');
		}
	}
	
	if ($this->params['_route'] == 'recover') {
		$this->render(__FILE__, 'recover');
	} else {
		$this->addJS(__FILE__, 'index');
		$this->render(__FILE__, 'view');
	}