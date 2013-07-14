<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	$return = array('success' => false, 'message' => '', 'time' => time());
	
	switch ($this->params['_route']) {
		case 'login':
			if ($this->auth->logged()) {
				$browser = isset($this->params['browser']) ? trim($this->params['browser']) : '';
				$version = isset($this->params['version']) ? trim($this->params['version']) : '';
				
				switch ($browser) {
					case 'chrome':
						if ($version != VERSION_CHROME) {
							$this->reply($return, false, 'TANIGER: Your extension is out of date. Please update it.', false);
						}
						break;
					default:
						$this->reply($return, false, 'TANIGER: Unknown browser', false);
						break;
				}
				
				$return['taniger_id'] = $this->facebook->get_facebook_id();
				$this->reply($return, true, '', false);
			} else {
				$this->reply($return, false, 'Please go to '. BASE .' and login before using TANIGER Privacy Protector', false);
			}
			break;
		default:
			$this->reply($return, false, 'TANIGER: Unknown Command', false);
			
			break;
	}