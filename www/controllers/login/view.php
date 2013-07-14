<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>
	<div class="content">
		<h3>Welcome back <?php $this->e($_SESSION['facebook']['first_name']); ?>.</h3>
		
		<p>
			Please login in order to continue.
		</p>
		
		<form action="/login" method="post">
			<div class="form">
				<label for="password">Password</label>
				<div><input type="password" name="password" id="password"></div>
				
				<div class="buttons">
					<button type="submit" name="submit" id="submit">login</button>
					<button type="button" name="logout" id="logout">logout</button>
				</div>
				
				<div class="recover"><a href="/login/recover">forgot your password?</a></span>
			</div>
		</form>
	</div>	