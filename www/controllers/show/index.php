<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	$this->is_error = ($this->params['_route'] == 'error');
	$this->error_message = isset($this->params['message']) ? urldecode($this->params['message']) : 'No message set';
	
	$this->render(__FILE__, 'view');