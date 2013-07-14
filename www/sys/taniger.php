<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	class taniger extends core {
		private $connection = array();
		
		public function __construct($host, $user, $pass, $name) {
			// Get current IP
			$this->ip = isset($_SERVER['REMOTE_ADDR']) ? long2ip(ip2long($_SERVER['REMOTE_ADDR'])) : '';
			
			// Store DB connection credentials
			$this->connection = array('host' => $host, 'user' => $user, 'pass' => $pass, 'name' => $name);
			
			// Process URL
			$this->processGet();
			
			// Facebook Init
			$this->facebook = new facebook($this);
			
			// Auth Init
			$this->auth = new auth($_SESSION['facebook']['user'], $this);
			
			// If it's a message display it without connecting to the database.
			if (!$this->processMessage()) {
				// Connect to the database
				$this->db = new database($this->connection['host'], $this->connection['user'], $this->connection['pass'], $this->connection['name']);
				if (!$this->db->is_connected()) { throw new Exception('Could not connect to the database.'); }
				
				if (defined('STATS') && STATS) { $this->record(); }
			}
			
			$this->route();
		}
		
		private function processGet() {
			$data = $_SERVER['REQUEST_URI'];
			$p = strpos($data, '?');
			if ($p !== false) { $data = substr($data, 0, $p); }
			
			$data = explode('/', $data);
			
			$this->params['_controller'] = 'index';
			$this->params['_route'] = '';
			
			$pointer = 1;
			
			if (isset($data[$pointer]) && !empty($data[$pointer])) {
				$this->params['_controller'] = preg_replace('/[^a-z0-9]/i', '', $data[$pointer]);
			}
			
			$pointer++;
			
			if (isset($data[$pointer]) && !empty($data[$pointer])) {
				$this->params['_route'] = preg_replace('/[^a-z0-9]/i', '', $data[$pointer]);
			}
			
			$pointer++;
			
			for ($i = $pointer; $i < count($data); $i += 2) {
				if (!empty($data[$i])) {
					if (substr($data[$i], 0, 1) == '?') { break; }
					$this->params[preg_replace('/[^a-z0-9]/i', '', $data[$i])] = (isset($data[$i + 1])) ? $data[$i + 1] : '';
				}
			}
			
			foreach ($_GET as $key => $value) {
				$this->params[$key] = $value;
			}
		}
		
		private function route() {
			$this->controller_path = '/controllers/'. $this->params['_controller'] . '/';
			
			if (!file_exists(PATH . 'controllers/'. $this->params['_controller'] .'/index.php')) { $this->redirect('/index'); }
			
			require_once(PATH . 'controllers/'. $this->params['_controller'] .'/index.php');
		}
		
		private function processMessage() {
			return ($this->params['_controller'] == 'show');
		}
	}