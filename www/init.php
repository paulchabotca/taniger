<?php
	if (!defined('SECURE')) { die('This file cannot be accessed directly.'); }
	
	function __load_class($class) {
		include './sys/'. $class .'.php';
	}
	spl_autoload_register('__load_class', true);
	
	session_start();
	
	if (!file_exists('config.php')) {
		die('config.php not found');
	}
	
	require_once('config.php');