<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	class facebook {
		protected $taniger = null;
		
		public function __construct(&$taniger) {
			if (!isset($_SESSION['facebook'])) {
				$_SESSION['facebook'] = array('user' => 0, 
																			'code' => '', 
																			'access_token' => '', 
																			'app_token' => '',
																			'first_name' => '',
																			'last_name' => '',
																			'full_name' => '');
			}
			
			$this->taniger = $taniger;
		}
		
		public function facebookLogin() {
			if (isset($_GET['code']) && empty($_SESSION['facebook']['token'])) {
				$token = @file_get_contents('https://graph.facebook.com/oauth/access_token?client_id='. FACEBOOK_APP_ID .'&redirect_uri='. BASE .'&client_secret='. FACEBOOK_APP_SECRET_ID .'&code=' . $_GET['code']);
				if (substr($token, 0, strlen('access_token=')) == 'access_token=') {
					$_SESSION['facebook']['access_token'] = $token;
					$_SESSION['facebook']['code'] = $_GET['code'];
					$_SESSION['facebook']['user'] = $this->facebookUserID($_SESSION['facebook']['first_name'], $_SESSION['facebook']['last_name']);
					$_SESSION['facebook']['full_name'] = $_SESSION['facebook']['first_name'] . ' ' . $_SESSION['facebook']['last_name'];
					
					$vars = array();
					parse_str($token, $vars);
					$_SESSION['facebook']['access_token_clean'] = $vars['access_token'];
					
					// Now get an app token.
					$token = @file_get_contents('https://graph.facebook.com/oauth/access_token?client_id='. FACEBOOK_APP_ID .'&client_secret='. FACEBOOK_APP_SECRET_ID .'&grant_type=client_credentials');
					if (substr($token, 0, strlen('access_token=')) == 'access_token=') {
						$_SESSION['facebook']['app_token'] = $token;
						
						$this->taniger->redirect('/index');
					}
				}
			}
			
			return ($this->is_logged());
		}
		
		public function get_facebook_id() {
			return $_SESSION['facebook']['user'];
		}
		
		public function get_facebook_full_name() {
			return $_SESSION['facebook']['full_name'];
		}
		
		public function is_logged() {
			return ($_SESSION['facebook']['user'] > 0);
		}
		
		public function facebookUserID(&$first_name, &$last_name) {
			$result = $this->FQL("SELECT uid, first_name, last_name FROM user WHERE uid = me()");
			if ($result === false) { return 0; }
			
			$first_name = $result->data[0]->first_name;
			$last_name = $result->data[0]->last_name;
			
			return $result->data[0]->uid;
		}
		
		private function FQL($fql) {
			$data = @file_get_contents('https://graph.facebook.com/fql?q=' . urlencode($fql) . '&' . $_SESSION['facebook']['access_token']);
			return json_decode($data);
		}
		
		public function confirmIdentity() {
			if ($_SESSION['facebook']['user'] <= 0) { return false; }
			
			$response = @file_get_contents('https://graph.facebook.com/debug_token?input_token=' . $_SESSION['facebook']['access_token_clean'] . '&' . $_SESSION['facebook']['app_token']);
			$data = json_decode($response);
			
			if (!$data->data->is_valid) { return false; }
			
			return ($data->data->user_id == $_SESSION['facebook']['user']);
		}
	}