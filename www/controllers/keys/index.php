<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	$return = array('success' => false, 'message' => '');
	
	if (!$this->auth->logged()) { $this->reply($return, false, 'TANIGER: You are not logged.', false); }
	
	switch ($this->params['_route']) {
		case 'set':
			$user = isset($this->params['u']) ? trim($this->params['u']) : '';
			$key = isset($this->params['k']) ? (int)$this->params['k'] : 0;
			$pass = isset($this->params['e']) ? urldecode(trim($this->params['e'])) : '';
			
			if (empty($user)) { $this->reply($return, false, '', false); }
			if ($key <= 0) { $this->reply($return, false, '', false); }
			if (empty($pass) || is_array($pass)) { $this->reply($return, false, '', false); }
			
			if (!$this->checkPassword($pass)) { $this->reply($return, false, 'TANIGER: Invalid encryption key', false); }
			if (!$this->checkKey($key)) { $this->reply($return, false, 'TANIGER: Invalid key ID', false); }
			
			if (strcmp($this->auth->id, $user) > 0) {
				$user_1 = $user;
				$user_2 = $this->auth->id;
			} else {
				$user_1 = $this->auth->id;
				$user_2 = $user;
			}
			
			$sql = "INSERT IGNORE INTO encryption_keys (user_id_1, user_id_2, key_timestamp, encryption_key)
							VALUES('". $this->db->escape($user_1) ."', '". $this->db->escape($user_2) ."', ". $key .", '". $this->db->escape($pass) ."')";
			$res = $this->db->query($sql);
			if (!$res) { $this->reply($return, false, 'TANIGER: Cannot store encryption key', false); }
			
			$this->reply($return, true, '', false);
			
			break;
		case 'get':
			$user = isset($this->params['u']) ? trim($this->params['u']) : '';
			$key = isset($this->params['k']) ? (int)$this->params['k'] : 0;
			
			if (empty($user)) { $this->reply($return, false, '', false); }
			if ($key <= 0) { $this->reply($return, false, '', false); }
			
			if (strcmp($this->auth->id, $user) > 0) {
				$user_1 = $user;
				$user_2 = $this->auth->id;
			} else {
				$user_1 = $this->auth->id;
				$user_2 = $user;
			}
			
			$sql = "SELECT encryption_key FROM encryption_keys WHERE user_id_1 = '". $this->db->escape($user_1) ."' AND user_id_2 = '". $this->db->escape($user_2) ."' AND key_timestamp = " . $key;
			$res = $this->db->query($sql);
			if (!$res) { $this->reply($return, false, 'TANIGER: Cannot retrieve encryption key', false); }
			if ($this->db->rows($res) == 0) { $this->reply($return, false, '', false); }
			
			$row = $this->db->fetch($res);
			
			$return['password'] = $row['encryption_key'];
			$this->reply($return, true, '', false);
			
			break;
		default:
			$this->reply($return, false, 'TANIGER: Unknown Command', false);
			
			break;
	}