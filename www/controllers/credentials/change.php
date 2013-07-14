<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>
	<div class="content">
		<h3>Change your password</h3>
		
		<form action="/credentials" method="post">
			<div class="form">
				<label for="current">Current Password</label>
				<div><input type="password" name="current" id="current" value=""></div>
				
				<label for="new">New Password</label>
				<div><input type="password" name="new" id="new" value=""></div>
				
				<label for="confirm">Confirm Password</label>
				<div><input type="password" name="confirm" id="confirm" value=""></div>
				
				<div class="buttons">
					<button type="submit" name="submit" id="submit">change</button>
				</div>
			</div>
		</form>
	</div>