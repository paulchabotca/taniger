<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>
	<div class="content">
		<?php if ($this->is_error) { ?>
		<h2>Houston, we have a problem.</h2>
		<?php } else { ?>
		<h2>Well played.</h2>
		<?php } ?>
		
		<p><?php $this->e($this->error_message); ?></p>
	</div>