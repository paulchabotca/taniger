<?php if (!defined('SECURE')) { die('This file cannot be accessed directly.'); } ?>
	<div class="description">
		<p>Do you care about your online privacy while chatting on <b>facebook</b>?</p>
		<p>If you do, then <b>TANIGER</b> is what you need.</p>
		<p>TANIGER is an online service that <b>protects your facebook conversations</b><br />by encrypting your messages.</p>
		<p>Secure your conversations using encryption algorithms like:<br />AES, DES, TripleDES, RC4 and Rabbit.</p>
		<p>Anyone can use it.</p>
		<p>All you have to do is install the extension to your browser and enable it when required.</p>
	</div>
	
	<ul id="steps">
		<li class="level-1">
			<div class="number">1</div>
			<div class="text">
				Download and install the <b>taniger privacy protection</b> extension for your browser.
				
				<div>
					<ul class="extensions">
						<li><a href="/extensions/firefox" title="Firefox" class="ext-firefox ext"><img src="/img/firefox24.png" alt="firefox" /></a></li>
						<li><a href="/extensions/chrome" title="Chrome" class="ext-chrome"><img src="/img/chrome24.png" alt="chrome" /></a></li>
						<li><a href="/extensions/ie" title="Internet Explorer" class="ext-ie ext"><img src="/img/ie24.png" alt="internet explorer" /></a></li>
						<li><a href="/extensions/safari" title="Safari" class="ext-safari ext"><img src="/img/safari24.png" alt="safari" /></a></li>
						<li><a href="/extensions/opera" title="Opera" class="ext-opera ext"><img src="/img/opera24.png" alt="opera" /></a></li>
					</ul>
				</div>
			</div>
			<div class="clear"></div>
		</li>
		<li class="level-1">
			<div class="number">2</div>
			<div class="text">
				<?php if ($this->facebook->is_logged()) { ?>
				You have already logged in through facebook <b><?php $this->e($_SESSION['facebook']['full_name']); ?></b>. (<a href="/logout/login">Not you?</a>)
				<?php } else { ?>
				Login using your facebook account.
				
				<div class="fb-login">
					<a href="https://www.facebook.com/dialog/oauth?client_id=<?php echo FACEBOOK_APP_ID; ?>&redirect_uri=<?php echo BASE; ?>"><img src="/img/fb-login.png" alt="facebook login"></a>
				</div>
				<?php } ?>
			</div>
			<div class="clear"></div>
		</li>
		<li class="level-1">
			<div class="number">3</div>
			<div class="text">
				Enable the extension in your browser and you are ready to go!
			</div>
			<div class="clear"></div>
		</li>
		<li class="level-1">
			<div class="number">?</div>
			<div class="text">
				<span>For a step by step tutorial on how to use taniger privary protection <a href="/tutorial">click here</a>.</span>
			</div>
			<div class="clear"></div>
		</li>
		<li class="level-1">
			<div class="number number-red"></div>
			<div class="text">
				<span>Why? Because your privacy matters.</span>
			</div>
		</li>
	</ul>
	