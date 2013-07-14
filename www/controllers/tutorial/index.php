<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	$this->addJS('', '/js/lightbox.js', true);
	$this->addCSS('', '/css/lightbox.css', true);
	
	$this->render(__FILE__, 'view');