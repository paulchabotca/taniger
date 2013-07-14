<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	class database {
		protected $link;
		protected $error;
		
		function __construct($host, $user, $pass, $database = '', $connectQuery = '') {
			$this->link = @mysql_connect($host, $user, $pass);
			if (!$this->link) {
				$this->error = mysql_error();
				return false;
			}
			if (!empty($database)) {
				$result = @mysql_select_db($database, $this->link);
				if (!$result) {
					$this->error = mysql_error();
					@mysql_close($this->link);
					$this->link = null;
					return false;
				}
			}
			if (!empty($connectQuery)) {
				$result = @mysql_query($connectQuery, $this->link);
				if (!$result) {
					$this->error = mysql_error();
					@mysql_close($this->link);
					$this->link = null;
					return false;
				}
			}
			return true;
		}
		
		function __destruct() {
			if ($this->link) {
				$this->close();
			}
			$this->link = null;
			return true;
		}
		
		public function last_error() {
			return $this->error;
		}
		
		public function affected() {
			return mysql_affected_rows($this->link);
		}
		
		public function close() {
			if (!$this->link) { return false; }
			@mysql_close($this->link);
			return true;
		}
		
		public function query($sql) {
			$error = '';
			if (!$this->link) { return false; }
			
			$item = array();
			$item['sql'] = $sql;
			$item['time'] = -1;
			$start = microtime(true);
			
			$result = @mysql_query($sql, $this->link);
			
			$item['time'] = microtime(true) - $start;
			
			unset($item);
			if ($result) {
				return $result;
			} else {
				$this->error = mysql_error();
				return false;
			}
		}
		
		public function rows($result) {
			return ($result) ? mysql_num_rows($result) : -1;
		}
		
		public function fetch($result) {
			return ($result) ? mysql_fetch_array($result) : false;
		}
		
		public function next_id() {
			return ($this->link) ? mysql_insert_id($this->link) : -1;
		}
		
		public function escape($value) {
			return ($this->link) ? @mysql_real_escape_string($value, $this->link) : @mysql_real_escape_string($value);
		}
		
		public function is_connected() {
			return ($this->link) ? true : false;
		}
		
		public function enquote($text) {
			return "'" . $text . "'";
		}
		
		public function build($type, $table, $fields) {
			$sql = "";
			
			switch ($type) {
				case 'INSERT':
					$sql = "INSERT INTO `". $table ."` (". implode(', ', array_keys($fields)) .") VALUES(". implode(', ', array_values($fields)) .");";
					break;
				default:
					break;
			}
			
			return $sql;
		}
	}