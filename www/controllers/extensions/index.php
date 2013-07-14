<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	switch ($this->params['_route']) {
		case 'chrome':
			$this->render(__FILE__, 'chrome');
			break;
		default:
			$this->redirect('/index');
			break;
	}