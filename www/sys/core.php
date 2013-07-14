<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	class core {
		public $db = null;
		protected $js = array();
		protected $css = array();
		protected $controller_path = '';
		protected $facebook = null;
		protected $auth = null;
		protected $params = array();
		protected $ip = '';
		
		protected $error_message = '';
		
		public function redirect($url, $vars = array()) {
			if (count($vars) > 0) {
				if (substr($url, -1) != '/') { $url .= '/'; }
				$data = '';
				
				foreach ($vars as $key => $value) {
					if (!empty($data)) { $data .= '&'; }
					$data .= $key . '=' . urlencode($value);
				}
				
				$url .= '?' . $data;
			}
			
			header('Location: ' . $url);
			die();
		}
		
		protected function e($message, $return = false) {
			if ($return) {
				return htmlspecialchars($message, ENT_QUOTES);
			} else {
				echo htmlspecialchars($message, ENT_QUOTES);
			}
		}
		
		protected function loadHeader() {
			require_once(PATH . 'view/_header.php');
		}
		
		protected function render($path, $view) {
			require_once(PATH . 'view/_header.php');
			require_once(dirname($path) . '/' . $view . '.php');
			require_once(PATH . 'view/_footer.php');
		}
		
		protected function addJS($path, $script, $raw = false) {
			if ($raw) {
				$this->js[] = $script;
			} else {
				$this->js[] = $this->controller_path . $script . '.js';
			}
		}
		
		protected function addCSS($path, $script, $raw = false) {
			if ($raw) {
				$this->css[] = $script;
			} else {
				$this->css[] = $this->controller_path . $script . '.css';
			}
		}
		
		public function isValidEmail($email) {
			return (filter_var($email, FILTER_VALIDATE_EMAIL));
		}
		
		public function hasMessage(&$message, &$class) {
			$message = '';
			$class = '';
			
			if (isset($this->params['error'])) {
				$class = 'error';
				$message = urldecode($this->params['error']);
			} else if (isset($this->params['success'])) {
				$class = 'success';
				$message = urldecode($this->params['success']);
			}
			
			return (!empty($message) && !empty($class));
		}
		
		public function reply($return, $success, $message = '', $crossdomain = false) {
			$return['success'] = $success;
			$return['message'] = $message;
			
			if ($crossdomain) {
				if (isset($_GET['callback'])) { echo $_GET['callback']; }
				echo '(';
			}
			
			echo json_encode($return);
			
			if ($crossdomain) {
				echo ');';
			}
			die();
		}
		
		public function checkPassword($password) {
			for ($i = 0; $i < strlen($password); $i++) {
				if (strpos(KEY_CHARACTER_SET, $password[$i]) === false) { return false; }
			}
			return true;
		}
		
		public function checkKey($key) {
			$time = strtotime('-5 minutes', time());
			return ($key > $time);
		}
		
		protected function record() {
			$ref = isset($_SERVER['HTTP_REFERER']) ? trim($_SERVER['HTTP_REFERER']) : '';
			$url = isset($_SERVER['REQUEST_URI']) ? trim($_SERVER['REQUEST_URI']) : '';
			
			$sql = "INSERT INTO statistics (session, last_page, ip, last_active, referer, user_id) VALUES('". $this->db->escape(session_id()) ."', '". $this->db->escape($url) ."', '". $this->db->escape($this->ip) ."', NOW(), '". $this->db->escape($ref) ."', '". $this->db->escape($this->auth->id) ."')";
			$res = $this->db->query($sql);
		}
	}