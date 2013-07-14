<?php
	define('SECURE', true);
	
	require_once('init.php');
	
	try {
		$app = new taniger(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	} catch (Exception $e) {
		header('Location: /show/error/message/' . urlencode($e->getMessage()));
		die();
	}