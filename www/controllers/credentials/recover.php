<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>
	<div class="content">
		<h3>Reset your password</h3>
		
		<form action="/credentials/recover/key/<?php echo $this->recovery_key; ?>/user/<?php echo $this->recovery_id; ?>" method="post">
			<div class="form">
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