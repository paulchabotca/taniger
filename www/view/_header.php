<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>
<!doctype html>
<html>
	<head>
		<base href="<?php echo BASE; ?>">
		<title>TANIGER - Privacy Protection Service</title>
		
		<meta charset="utf-8">
		
		<link rel="icon" type="image/png" href="/img/favicon.png" />
		
		<!--[if lte IE 8]>
		<script>
		  document.createElement('header');
		  document.createElement('section');
		  document.createElement('article');
		  document.createElement('aside');
		  document.createElement('nav');
		  document.createElement('footer');
		</script>
		<![endif]-->
		
		<link rel="stylesheet" href="/css/normalize.css">
		<link rel="stylesheet" href="/css/default.css">
		
		<?php
			for ($i = 0; $i < count($this->css); $i++) {
		?>
		<link rel="stylesheet" href="<?php echo $this->css[$i]; ?>">
		<?php
			}
		?>
		
		<script src="/js/jquery.js"></script>
		<script src="/js/functions.js"></script>
		
		<?php
			for ($i = 0; $i < count($this->js); $i++) {
		?>
		<script type="text/javascript" src="<?php echo $this->js[$i]; ?>"></script>
		<?php
			}
		?>
	</head>
	<body>
		<section id="container">
			<div class="logo"><a href="/index"><img src="/img/logo.png" alt="logo" /></a></div>
			
			<?php
			$message = '';
			$class = '';
			if ($this->hasMessage($message, $class)) {
			?>
			<div id="message" class="<?php echo $class; ?>"><?php $this->e($message); ?></div>
			<?php
			}
			?>
			
			