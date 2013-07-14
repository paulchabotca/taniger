<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>
	<div class="content">
		<h3>Seems to me that you are new here.</h3>
		
		<p>
			Why do you have to register if you have already logged in using your facebook account?
		</p>
		<p>
			This is done to prevent someone reading your encrypted conversations even if your facebook account has been compromised.
			With an extra password you are even safer.
		</p>
		
		<form action="/register" method="post">
			<div class="form">
				<label for="email">E-mail</label>
				<div><input type="text" name="email" id="email"></div>
				
				<label for="password">Password</label>
				<div><input type="password" name="password" id="password"></div>
				
				<label for="confirm">Confirm Password</label>
				<div><input type="password" name="confirm" id="confirm"></div>
				
				<div class="buttons">
					<button type="submit" name="submit" id="submit">register</button>
					<button type="button" name="logout" id="logout">logout</button>
				</div>
			</div>
		</form>
	</div>	