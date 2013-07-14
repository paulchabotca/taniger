<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	class auth {
		public $id = 0;
		public $mail = '';
		public $facebook_id = 0;
		
		protected $taniger = null;
		
		public function __construct($id, &$taniger) {
			$this->facebook_id = $id;
			$this->taniger = $taniger;
			
			if (!isset($_SESSION['user_id'])) { $_SESSION['user_id'] = 0; }
			if (!isset($_SESSION['user_mail'])) { $_SESSION['user_mail'] = ''; }
			$this->id = $_SESSION['user_id'];
			$this->mail = $_SESSION['user_mail'];
		}
		
		public function loginOrRegister() {
			if ($this->facebook_id <= 0) { return false; }
			
			if (!$this->user_exists()) {
				$this->taniger->redirect('/register');
			}
			$this->taniger->redirect('/login');
		}
		
		public function logged() {
			return ($this->id > 0);
		}
		
		public function user_exists() {
			$sql = "SELECT id FROM users WHERE id = '". $this->facebook_id ."' LIMIT 1";
			$res = $this->taniger->db->query($sql);
			if (!$res) { $this->redirect('/show/error/message/' . urlencode('Could not query database. Please try again.')); }
			return ($this->taniger->db->rows($res) == 1);
		}
		
		public function createUser($email, $password, $autologin = false) {
			if ($this->facebook_id <= 0) { return false; }
			
			$sql = "INSERT INTO users (id, password, email) VALUES('". $this->facebook_id ."', '". $this->taniger->db->escape($this->hashPassword($password)) ."', '". $this->taniger->db->escape($email) ."')";
			$res = $this->taniger->db->query($sql);
			if (!$res) { return false; }
			
			if ($autologin) { $this->autologin(); }
			return true;
		}
		
		public function hashPassword($password) {
			return hash('sha512', PASSWORD_SALT . $password);
		}
		
		public function autologin() {
			if ($this->facebook_id <= 0) { return false; }
			
			$this->id = $this->facebook_id;
			$_SESSION['user_id'] = $this->id;
			return false;
		}
		
		public function login($password) {
			if ($this->facebook_id <= 0) { return false; }
			
			$sql = "SELECT email FROM users WHERE id = '". $this->facebook_id ."' AND password = '". $this->taniger->db->escape($this->hashPassword($password)) ."' LIMIT 1";
			$res = $this->taniger->db->query($sql);
			if (!$res) { return false; }
			if ($this->taniger->db->rows($res) != 1) { return false; }
			$row = $this->taniger->db->fetch($res);
			
			$this->mail = $row['email'];
			$this->id = $this->facebook_id;
			$_SESSION['user_id'] = $this->id;
			$_SESSION['user_mail'] = $this->mail;
			
			return true;
		}
	}