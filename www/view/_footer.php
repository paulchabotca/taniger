<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>			
		</section>
		
		<footer>
			<ul>
				<li><a href="/index">home</a></li>
				<li>|</li>
				
				<li><a href="/about">about</a></li>
				<?php if ($this->auth->logged()) { ?>
				<li>|</li>
				
				<li><a href="/credentials">change password</a></li>
				<li>|</li>
				
				<li><a href="/logout">logout</a></li>
				<?php } ?>
			</ul>
			
			<div class="copyright">
				copyright 2013 &copy; <a href="https://www.taniger.com/">taniger.com</a>
			</div>
		</footer>
	</body>
</html>