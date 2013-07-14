<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	$this->is_recovery = false;
	$this->recovery_key = '';
	$this->recovery_id = '';
	
	if ($this->facebook->is_logged() && !$this->auth->logged()) {
		// Check if it's password recovery
		$key = isset($this->params['key']) ? trim($this->params['key']) : '';
		$user = isset($this->params['user']) ? trim($this->params['user']) : '';
		
		if (!empty($key) && !empty($user)) {
			$sql = "SELECT email FROM users WHERE id = '". $this->db->escape($user) ."' AND validation = '". $this->db->escape($key) ."' LIMIT 1";
			$res = $this->db->query($sql);
			if (!$res || $this->db->rows($res) == 0) {
				$this->redirect('/credentials/show/error/' . urlencode('Invalid recovery details.'));
			}
			
			$this->is_recovery = true;
			$this->recovery_key = $key;
			$this->recovery_id = $user;
		}
	}
	
	if (!$this->auth->logged() && !$this->is_recovery) { $this->redirect('/index'); }
	
	// Form processing
	if (isset($_POST['submit'])) {
		$current = isset($_POST['current']) ? trim($_POST['current']) : '';
		$new = isset($_POST['new']) ? trim($_POST['new']) : '';
		$confirm = isset($_POST['confirm']) ? trim($_POST['confirm']) : '';
		
		if (!$this->is_recovery && empty($current)) {
			$this->redirect('/credentials/show/error/' . urlencode('Please enter your current password'));
		}
		
		if (strlen($new) < MIN_PASSWORD_LENGTH || $new != $confirm) {
			$this->redirect('/credentials/show/error/' . urlencode('Please enter your new password'));
		}
		
		$id = '';
		$new_hash = $this->auth->hashPassword($new);
		if ($this->is_recovery) {
			$id = $this->recovery_id;
		} else {
			$current_hash = $this->auth->hashPassword($current);
			
			$sql = "SELECT id FROM users WHERE id = '". $this->db->escape($this->auth->id) ."' AND password = '". $this->db->escape($current_hash) ."' LIMIT 1";
			$res = $this->db->query($sql);
			if (!$res || $this->db->rows($res) == 0) {
				$this->redirect('/credentials/show/error/' . urlencode('Invalid current password'));
			}
			$id = $this->auth->id;
		}
		
		$sql = "UPDATE users SET validation = '', password = '". $this->db->escape($new_hash) ."' WHERE id = '". $this->db->escape($id) ."' LIMIT 1";
		$res = $this->db->query($sql);
		if (!$res) {
			$this->redirect('/credentials/show/error/' . urlencode('Could not update your password. Please try again.'));
		}
		$this->redirect('/show/success/message/' . urlencode('Password changed.'));
	}
	
	if ($this->is_recovery) {
		$this->addJS(__FILE__, 'recover');
		$this->render(__FILE__, 'recover');
	} else {
		$this->addJS(__FILE__, 'change');
		$this->render(__FILE__, 'change');
	}
	