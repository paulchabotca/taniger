/*
 * TANIGER Chrome Extension
 * https://github.com/sadreck/taniger
 *
 * Copyright 2013, Pavel Tsakalidis [ p@vel.gr / info@taniger.com ]
 * https://www.taniger.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

jQuery.noConflict();

/* Chrome message receiver from background */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request && Taniger.isDefined(request.controller)) {
		Taniger.receiver(request);
	}
});

/* I am using some phpjs functions to make my life easier. */
var PHP_Functions = {
	rand: function(min, max) {
		/* http://phpjs.org/functions/rand/ */
		var argc = arguments.length;
	  if (argc === 0) {
	    min = 0;
	    max = 2147483647;
	  } else if (argc === 1) {
	    throw new Error('Warning: rand() expects exactly 2 parameters, 1 given');
	  }
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	
	time: function() {
		/* http://phpjs.org/functions/time/ */
		return Math.floor(new Date().getTime() / 1000);
	},
	
	urlencode: function(str) {
		/* http://phpjs.org/functions/urlencode/ */
		str = (str + '').toString();
		return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
	},
	
	is_numeric: function(mixed_var) {
		return (typeof(mixed_var) === 'number' || typeof(mixed_var) === 'string') && mixed_var !== '' && !isNaN(mixed_var);
	},
	
	str_replace: function(search, replace, subject, count) {
		/* http://phpjs.org/functions/str_replace/ */
	  var i = 0,
	    j = 0,
	    temp = '',
	    repl = '',
	    sl = 0,
	    fl = 0,
	    f = [].concat(search),
	    r = [].concat(replace),
	    s = subject,
	    ra = Object.prototype.toString.call(r) === '[object Array]',
	    sa = Object.prototype.toString.call(s) === '[object Array]';
	  s = [].concat(s);
	  if (count) {
	    this.window[count] = 0;
	  }
	
	  for (i = 0, sl = s.length; i < sl; i++) {
	    if (s[i] === '') {
	      continue;
	    }
	    for (j = 0, fl = f.length; j < fl; j++) {
	      temp = s[i] + '';
	      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
	      s[i] = (temp).split(f[j]).join(repl);
	      if (count && s[i] !== temp) {
	        this.window[count] += (temp.length - s[i].length) / f[j].length;
	      }
	    }
	  }
	  return sa ? s : s[0];
	}
};

var Taniger = {
	// This will hold all of the configuration
	config: null,
	hTimer: null,
	
	/* Begin the magic */
	init: function() {
		// Attach required events.
		this.attach();
		// Get the global configuration from background.js
		this.broadcast('get-config', { });
	},
	
	/* Attach listener for keydown. */
	attach: function() {
		window.addEventListener('keydown', function(e) {
			Taniger.processKey(e);
		}, true);	// The last parameter does all the magic. Took me a few days to figure that out.
	},
	
	/* Process each keypress in order to detect the enter key */
	processKey: function(e) {
		// Which key was pressed
		var k = (e.keyCode ? e.keyCode : e.which);
		
		// Was it the ENTER key?
		if (13 == k) {
			var item = e.target;
			
			if (item.tagName.toLowerCase() == 'textarea' && this.hasAttr(item, 'taniger-user-id')) {
				var user_id = jQuery(item).attr('taniger-user-id');
				var text = jQuery(item).val();
				
				jQuery(item).val(this.encrypt(text, user_id));
			}
		}
	},
	
	/* Receiver for the background broadcasts */
	receiver: function(options) {
		if (!this.isDefined(options.controller)) { return false; }
		
		switch (options.controller) {
			case 'full-config':
				this.config = options.config;
				break;
			case 'config':
				this.isDefined(options.disabled) && (this.config.disabled = options.disabled);
				this.isDefined(options.logged) && (this.config.logged = options.logged);
				this.isDefined(options.TNGTime) && (this.config.TNGTime = options.TNGTime);
				this.isDefined(options.taniger_id) && (this.config.taniger_id = options.taniger_id);
				
				// If disabled, clear array.
				if (this.config.disabled && !this.config.logged) {
					this.config.chats = new Array();
					// Clear all icons.
					this.clearInterface();
				}
				
				break;
			case 'add-chat':
				this.addChat(0, '', false, options.data);
				break;
			case 'update-chat':
				this.editChat(options.data);
				break;
			case 'add-key':
				this.addKey(options.data);
				break;
			case 'validate':
				this.validateUser(options.id);
				break;
		}
		
		// Enable / Disable monitoring
		if (this.isDefined(options.enable)) {
			if (options.enable) {
				if (this.hTimer == null) { this.monitor(); }
			} else {
				if (this.hTimer != null) { clearTimeout(this.hTimer); }
			}
		}
	},
	
	/* A similar function from background.js which sends data/requests to the background */
	broadcast: function(controller, options) {
		options.controller = controller;
		
		chrome.runtime.sendMessage(options, function(response) {
			if (response && Taniger.isDefined(response.controller)) {
				Taniger.receiver(response);
			}
		});
	},
	
	/* Validate the facebook user */
	validateUser: function(user_id) {
		var user_selector = 'a[data-gt="'+ '{"chrome_nav_item":"timeline_chrome"}' +'"]';
		var current_user = jQuery(user_selector);
		if (current_user.length == 0) { return false; }
		
		var user_url = jQuery(current_user).attr('href');
		
		// Request the id from graph
		var url = PHP_Functions.str_replace('www.', 'graph.', user_url);
		jQuery.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			type: 'GET',
			crossDomain: true,
			success: function(data) {
				if (null != data && Taniger.isDefined(data.id)) {
					// Set the user's id
					if (data.id != Taniger.config.taniger_id) {
						// Since something went wrong, we must broadcast this change to all tabs.
						Taniger.config.fb_id = null;
						Taniger.config.taniger_id = null;
						
						Taniger.broadcast('config', { fb_id: null, taniger_id: null });
						
						alert('Taniger/Facebook ID mismatch. Please go to TANIGER and login with your facebook account');
						
					} else {
						Taniger.config.fb_id = Taniger.config.taniger_id;
						Taniger.monitor();
					}
				} else {
					/* Something went wrong */
				}
			}
		});
	},
	
	/* This is actually the background worker that does all the job */
	monitor: function() {
		// This is to prevent the function from double-execution
		if (this.enabled() && this.hTimer == null) {
			// Get open conversations.
			this.getOpenConversations();
			
			// Add buttons etc.
			this.processInterface();
			
			// Decrypt
			this.decryptMessages();
		}
		
		this.hTimer = setTimeout("Taniger.hTimer = null; Taniger.monitor();", this.config.monitorInterval);
	},
	
	/* inject html code into facebook */
	processInterface: function() {
		var html = this.getHTML();
		
		this.singleChatHTML(html);
		this.tabbedChatHTML(html);
		
		// Add some global events
		jQuery('.taniger-interface[name="new"]').each(function() {
			// Remove the identifier to avoid re-attaching events.
			jQuery(this).removeAttr('name');
			
			// This is just to save the options and close the menu, nothing fancy.
			jQuery(this).find('.ok').click(function() {
				Taniger.saveOptions(this);
				Taniger.hideMenu(this);
				return false;
			});
			
			jQuery(this).find('.secure-button a').click(function() {
				Taniger.toggleProtection(this);
				return false;
			});
			
			jQuery(this).find('.settings a').click(function() {
				Taniger.showMenu(this);
				return false;
			});
			
			/*
				I stop the propagation because in tabbed chat when you would click the menu, it would close.
				
				One does not simply mess with the facebook javascript framework.
			*/
			jQuery(this).click(function(e) {
				e.stopPropagation();
			});
		});
	},
	
	/* Toggle secure/unsecure state */
	toggleProtection: function(obj) {
		// Detect all of our HTML
		var box = jQuery(obj).closest('.taniger-interface');
		
		// Get the user id
		var user_id = jQuery(obj).attr('taniger-user-id');
		
		// Retrieve user's position
		var chat_index = this.getChatIndex(user_id, '');
		
		// -1 should never happen.
		if (chat_index == -1) { return false; }
		
		this.config.chats[chat_index].secure = !this.config.chats[chat_index].secure;
		
		// Switch icons
		if (this.config.chats[chat_index].secure) {
			jQuery(box).find('.unsecure').hide();
			jQuery(box).find('.secure').show();
		} else {
			jQuery(box).find('.secure').hide();
			jQuery(box).find('.unsecure').show();
		}
		
		// And broadcast the changes to the background.
		this.broadcast('update-chat', { user_id: this.config.chats[chat_index].user_id, secure: this.config.chats[chat_index].secure });
	},
	
	/* Save options */
	saveOptions: function(obj) {
		// Detect all of our HTML
		var box = jQuery(obj).closest('.taniger-interface');
		// Detect the menu
		var menu = jQuery(box).find('.menu');
		
		// Get selected algorithm
		var algo = jQuery(menu).find('select').val();
		// And user id
		var user_id = jQuery(obj).attr('taniger-user-id');
		
		// Retrieve user's position
		var chat_index = this.getChatIndex(user_id, '');
		// -1 should never happen.
		if (chat_index == -1) { return false; }
		
		this.config.chats[chat_index].encryption = algo;
		
		// And broadcast the changes to the background.
		this.broadcast('update-chat', { user_id: this.config.chats[chat_index].user_id, encryption: algo });
	},
	
	
	/* Hide options menu */
	hideMenu: function(obj) {
		var menu = jQuery(obj).closest('.taniger-interface').find('.menu');
		jQuery(menu).fadeOut();
	},
	
	/* Set single chat HTML */
	singleChatHTML: function(html) {
		var textarea = jQuery('textarea[name="message_body"]');
		if (textarea.length == 0) { return false; }
		
		// Get the index of the conversation in the chats array.
		var chat_index = this.getUserFromChatBox(textarea, true);
		if (-1 == chat_index) { return false; }
		
		// If we don't have the user's ID, abort abort aboooort!
		if (!this.isUserValid(chat_index)) { return false; }
		
		var existing_user_id = '';
		(this.hasAttr(textarea, 'taniger-user-id')) && (existing_user_id = jQuery(textarea).attr('taniger-user-id'));
		
		// This works quite different than with the tabbed-chat, because it's the same textarea for all the conversations.
		
		// This is the whole div that has the textarea and all the extra buttons.
		var box = jQuery(textarea).parent().parent().parent();
		
		// Check if it's the same user and abort if it is (nothing to change)
		if (this.config.chats[chat_index].user_id == existing_user_id) {
			this.setOptions(jQuery(box).find('.taniger-interface').parent(), chat_index);
			return false;
		}
		
		// Set a new attribute to the textarea to identify the target user id
		jQuery(textarea).attr('taniger-user-id', this.config.chats[chat_index].user_id);
		
		// It's the first injection.
		if (existing_user_id.length == 0) {
			var div = jQuery('<div>').addClass('taniger-interface').html(html.single.secure + html.single.settings + html.single.clear + html.menu);
			jQuery(box).append(div);
			
			/*
				Here I add a dummy attribute in order to mark the injected html code as new.
				This way it will be easier to detect it and manipulate it
			*/
			jQuery(box).find('.taniger-interface').attr('name', 'new');
		}
		
		// Add the user's id to the OK button as well so we don't have to look for it again.
		jQuery(box).find('.taniger-interface .ok').attr('taniger-user-id', this.config.chats[chat_index].user_id);
		jQuery(box).find('.taniger-interface .secure-button a').attr('taniger-user-id', this.config.chats[chat_index].user_id);
		
		this.setOptions(jQuery(box).find('.taniger-interface').parent(), chat_index);
	},
	
	/* Set tabbed chat HTML */
	tabbedChatHTML: function(html) {
		jQuery('textarea.uiTextareaAutogrow').each(function() {
			var textarea = this;
			
			// Get the index of the conversation in the chats array.
			var chat_index = Taniger.getUserFromChatBox(textarea, false);
			if (-1 == chat_index) { return true; } // break
			
			// If we don't have the user's ID, abort abort aboooort!
			if (!Taniger.isUserValid(chat_index)) { return true; } // break
			
			// Get the textarea's existing user id
			var existing_user_id = '';
			(Taniger.hasAttr(textarea, 'taniger-user-id')) && (existing_user_id = jQuery(textarea).attr('taniger-user-id'));
			
			// Get the whole chat box
			var box = jQuery(textarea).closest('.fbDockChatTabFlyout');
			
			// textarea has already been injected with custom html. get to da chopaaaa
			if (existing_user_id.length > 0) {
				Taniger.setOptions(box, chat_index);
				return true;	 // break
			}
			
			// create the span
			var span = jQuery('<span>').addClass('taniger-interface').html(html.multi.settings + html.multi.secure + html.menu);
			
			// and add the icon.
			jQuery(box).find('.titlebarButtonWrapper').prepend(span);
			
			// Set a new attribute to the textarea to identify the target user id
			jQuery(textarea).attr('taniger-user-id', Taniger.config.chats[chat_index].user_id);
			
			// and add some events to it.
			jQuery(box).find('.taniger-interface .taniger-settings-icon').click(function() {
				Taniger.showMenu(this);
				return true;
			});
			
			jQuery(box).find('.taniger-interface .taniger-secure-icon').click(function() {
				Taniger.toggleProtection(this);
				return false;
			});
			
			// Add the user's id to the OK button as well so we don't have to look for it again.
			jQuery(box).find('.taniger-interface .ok').attr('taniger-user-id', Taniger.config.chats[chat_index].user_id);
			jQuery(box).find('.taniger-interface .taniger-secure-icon').attr('taniger-user-id', Taniger.config.chats[chat_index].user_id);
			
			/*
				Here I add a dummy attribute in order to mark the injected html code as new.
				This way it will be easier to detect it and manipulate it
			*/
			jQuery(box).find('.taniger-interface').attr('name', 'new');
			
			Taniger.setOptions(box, chat_index);
		});
	},
	
	/* Set options from the array - This helps if another tabs changes any settings */
	setOptions: function(box, chat_index) {
		// if the menu is open, don't mess with the values.
		if (jQuery(box).find('.menu').is(':visible')) { return false; }
		
		jQuery(box).find('.taniger-interface select').val(this.config.chats[chat_index].encryption);
		jQuery(box).find('.taniger-interface input.is-secured').prop('checked', this.config.chats[chat_index].secure);
		
		if (this.config.chats[chat_index].secure) {
			jQuery(box).find('.unsecure').hide();
			jQuery(box).find('.secure').show();
		} else {
			jQuery(box).find('.secure').hide();
			jQuery(box).find('.unsecure').show();
		}
	},
	
	/* Show options menu */
	showMenu: function(obj) {
		var button = { left: jQuery(obj).position().left, top: jQuery(obj).position().top, width: jQuery(obj).width(), height: jQuery(obj).height() };
		
		var m = jQuery(obj).closest('.taniger-interface').find('.menu');
		var menu = { left: 0, top: 0, width: jQuery(m).width(), height: jQuery(m).height(), padding_left: parseInt(jQuery(m).css('padding-left')), padding_top: parseInt(jQuery(m).css('padding-top')) };
		
		menu.top = button.top - menu.height - (menu.padding_top * 3.5);
		menu.left = button.left - menu.padding_left - ((menu.width - button.width) / 2);
		
		jQuery(m).css('top', menu.top + 'px').css('left', menu.left + 'px').show();
	},
	
	/* Check if an attribute exists */
	hasAttr: function(obj, attr) {
		var attr = jQuery(obj).attr(attr);
		return (typeof attr !== 'undefined' && attr !== false);
	},
	
	/* Retrieve a user from the selected message box */
	getUserFromChatBox: function(textarea, single_chat) {
		var user_url = '';
		
		if (single_chat) {
			
			var selected_user = jQuery('#webMessengerHeaderName a');
		} else {
			var box = jQuery(textarea).closest('.fbDockChatTabFlyout');
			if (1 != box.length) { return -1; }
			
			var selected_user = jQuery(box).find('h4 a');
		}
		
		if (1 == selected_user.length) {
			user_url = jQuery(selected_user).attr('href');
		}
		
		return Taniger.getChatIndex(0, user_url);
	},
	
	/* Get interface HTML */
	getHTML: function() {
		var html = new Object();
		
		html.single = { settings: '', secure: '', clear: '' };
		html.multi = { settings: '', secure: '' };
		
		html.single.settings = '<div class="settings button"><a href="#" title="Click here for TANIGER options"><img src="' + chrome.extension.getURL("images/settings24.png") + '" alt="taniger icon" /></a></div>';
		html.single.secure = '<div class="secure-button button"><span class="secure hidden"><a href="#" title="You are protected. Click here to disable TANIGER"><img src="' + chrome.extension.getURL("images/secure24.png") + '" alt="taniger icon" /></a></span><span class="unsecure"><a href="#" title="You are not protected. Click here to enable TANIGER"><img src="' + chrome.extension.getURL("images/unsecure24.png") + '" alt="taniger icon" /></a></span></div>';
		html.single.clear = '<div class="clear"></div>';
		
		html.multi.settings = '<a data-hover="tooltip" aria-label="Click here for TANIGER options" class="taniger-settings-icon"><img src="' + chrome.extension.getURL("images/settings16.png") + '" alt="taniger icon" /></a>';
		html.multi.secure = '<a data-hover="tooltip" aria-label="TANIGER Privacy Protection" class="taniger-secure-icon"><span class="unsecure"><img src="' + chrome.extension.getURL("images/unsecure16.png") + '" alt="taniger icon" /></span><span class="secure hidden"><img src="' + chrome.extension.getURL("images/secure16.png") + '" alt="taniger icon" /></span></a>';;
		
		html.menu = '<div class="menu hidden">';
		html.menu += '	<ul>';
		html.menu += '		<li>';
		html.menu += '			Algorithm';
		html.menu += '			<select class="algorithm">';
		
		for (var i = 0; i < this.config.algorithms.length; i++) {
			html.menu += '				<option value="' + this.config.algorithms[i].id + '">' + this.config.algorithms[i].name + '</option>';
		}
		
		html.menu += '			</select>';
		html.menu += '		</li>';
		html.menu += '		<li>';
		html.menu += '			<button class="btn ok">ok</button>';
		html.menu += '		</li>';
		html.menu += '	</ul>';
		html.menu += '</div>';
		
		return html;
	},
	
	enabled: function() {
		return (
						!this.config.disabled &&
						this.config.logged &&
						(this.config.taniger_id != null) &&
						(this.config.taniger_id == this.config.fb_id)
					);
	},
	
	/* Get all open conversations */
	getOpenConversations: function() {
		var users = new Array();
		var singleChatPage = new Array();
		var tabbedChatPage = new Array();
		
		singleChatPage = this.getPageChat();
		tabbedChatPage = this.getTabChats();
		
		// Join the 2 results
		users = singleChatPage.concat(tabbedChatPage);
		
		// Now, using the graph.facebook.com retrieve the user's ids from their urls
		for (var i = 0; i < users.length; i++) {
			// Check if the user already exists in the chat array
			var chat_index = this.getChatIndex(0, users[i]);
			// Add the user if he does not exist.
			if (-1 == chat_index) { chat_index = this.addChat(0, users[i], true, { }); }
			
			// If it's a valid user there is no need to acquire his id again.
			if (this.isUserValid(chat_index)) { continue; }
			
			// Get ID.
			this.getIDRequest(chat_index);
		}
	},
	
	/* AJAX call to get the user id from graph.facebook.com */
	getIDRequest: function(chat_index) {
		// Change www.facebook.com/user/ to graph.facebook.com/user/
		var url = PHP_Functions.str_replace('www.', 'graph.', this.config.chats[chat_index].user_url);
		
		jQuery.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			type: 'GET',
			crossDomain: true,
			success: function(data) {
				if (null != data && Taniger.isDefined(data.id)) {
					// Set the user's id
					Taniger.config.chats[chat_index].user_id = data.id;
					
					// And update the users array in the background
					Taniger.broadcast('update-chat', { user_id: Taniger.config.chats[chat_index].user_id, user_url: Taniger.config.chats[chat_index].user_url });
				} else {
					/* Something went wrong */
				}
			}
		});
	},
	
	/* Check if user is valid. A user is valid only if he has both id/url */
	isUserValid: function(chat_index) {
		var u1 = this.config.chats[chat_index].user_id.toString();
		var u2 = this.config.chats[chat_index].user_url.toString();
		
		return (u1.length > 1 && u2.length > 1);
	},
	
	/* Search and return the index of the chats[] array that corresponds to the conversation with user_id or user_url. */
	getChatIndex: function(user_id, user_url) {
		for (var i = 0; i < this.config.chats.length; i++) {
			if (user_id > 0 && this.config.chats[i].user_id == user_id) { return i; }
			if (user_url.length > 0 && this.config.chats[i].user_url == user_url) { return i; }
		}
		return -1;
	},
	
	/* Add the new key if it does not exist */
	addKey: function(options) {
		var user_id = 0;
		var user_url = '';
		
		// Either user_id OR user_url must ALWAYS exist.
		this.isDefined(options.user_id) && (user_id = options.user_id);
		this.isDefined(options.user_url) && (user_url = options.user_url);
		
		var chat_index = this.getChatIndex(user_id, user_url);
		// User does not exist
		if (chat_index == -1) { return { success: false }; }
		
		var key_index = this.getKeyIndex(chat_index, options.timestamp);
		// Key already exists
		if (key_index != -1) { return { success: false }; }
		
		// Add key
		this.config.chats[chat_index].keys.push({ timestamp: options.timestamp, cipher: key_cipher });
		
		// And sort if required
		if (this.isDefined(options.sort) && options.sort) {
			this.sortKeys(chat_index);
		}
	},
	
	/* Search and return the index of the key from a conversation */
	getKeyIndex: function(chat_index, timestamp) {
		for (var i = 0; i < this.config.chats[chat_index].keys.length; i++) {
			if (this.config.chats[chat_index].keys[i].timestamp == timestamp) { return i; }
		}
		return -1;
	},
	
	/* Sort encryption keys */
	sortKeys: function(chat_index) {
		for (var i = 0; i < this.config.chats[chat_index].keys.length; i++) {
			for (var k = i + 1; k < this.config.chats[chat_index].keys.length; k++) {
				if (this.config.chats[chat_index].keys[i].timestamp > this.config.chats[chat_index].keys[k].timestamp) {
					tmp = this.config.chats[chat_index].keys[i];
					this.config.chats[chat_index].keys[i] = this.config.chats[chat_index].keys[k];
					this.config.chats[chat_index].keys[k] = tmp;
				}
			}
		}
	},
	
	/* Edit specific properties of a chat */
	editChat: function(options) {
		var user_id = 0;
		var user_url = '';
		
		// Either user_id OR user_url must ALWAYS exist.
		this.isDefined(options.user_id) && (user_id = options.user_id);
		this.isDefined(options.user_url) && (user_url = options.user_url);
		
		var chat_index = this.getChatIndex(user_id, user_url);
		if (chat_index == -1) { return false; }
		
		// Update properties
		this.isDefined(options.user_id) && (this.config.chats[chat_index].user_id = options.user_id);
		this.isDefined(options.user_url) && (this.config.chats[chat_index].user_url = options.user_url);
		this.isDefined(options.secure) && (this.config.chats[chat_index].secure = options.secure);
		this.isDefined(options.encryption) && (this.config.chats[chat_index].encryption = options.encryption);
		
		return true;
	},
	
	/* Create a new chat conversation with user_id. */
	addChat: function (user_id, user_url, broadcast, chat) {
		if (this.isDefined(chat.user_id) && this.isDefined(chat.user_url)) {
			// If it's an object, check it the user exists. An object is passed as a result of a background broadcast.
			if (this.getChatIndex(chat.user_id, chat.user_url) != -1) { return false; }
		} else {
			chat = { user_id: user_id, user_url: user_url, keys: new Array(), secure: false, encryption: 1 };
		}
		
		this.config.chats.push(chat);
		
		if (broadcast) {
			/* Even if there are no extra data, send this new user to the background. */
			this.broadcast('add-chat', { data: chat });
		}
		
		return this.config.chats.length - 1;
	},
	
	/* This returns the user if you are chatting through facebook.com/messages */
	getPageChat: function() {
		var users = new Array();
		
		var a = jQuery('#webMessengerHeaderName a');
		if (1 == a.length) { users.push(jQuery(a).attr('href')); }
		
		return users;
	},
	
	/* This returns any open chat tab-windows */
	getTabChats: function() {
		var users = new Array();
		
		jQuery('.fbDockChatTabFlyout .titlebarLabel h4 a').each(function() {
			users.push(jQuery(this).attr('href'));
		});
		
		return users;
	},
	
	/* The magic happens here */
	encrypt: function(text, user_id) {
		if (!this.enabled()) { return text; }
		
		// Get the user's position from the global array.
		var chat_index = this.getChatIndex(user_id, '');
		// This should never happen, but if it does, return the plain text.
		if (-1 == chat_index) { return text; }
		
		// If the chat is unsecure, ABORT CAPTAIN
		if (!this.config.chats[chat_index].secure) { return text; }
		
		var key_cipher = '';
		var key_timestamp = -1;
		
		/* If this is the first message sent, there will be no encryption/decryption keys. */
		if (0 == this.config.chats[chat_index].keys.length) {
			/*
				We generate a cipher key and a key timestamp.
				The timestamp is the id of the cipher key and is used to retrieve it.
			*/
			key_cipher = this.generateKey(this.config.key_size);
			key_timestamp = PHP_Functions.time() + this.config.TNGTime;
			
			/* Add the generated pair to the user's chat. */
			this.addCipher(key_cipher, key_timestamp, chat_index, false);
			/* And send it for storage. */
			this.storeCipher(key_cipher, key_timestamp, chat_index);
		} else {
			/* If this is not the first message, take the latest cipher pair. */
			var p = this.config.chats[chat_index].keys.length - 1;
			key_cipher = this.config.chats[chat_index].keys[p].cipher;
			key_timestamp = this.config.chats[chat_index].keys[p].timestamp;
		}
		
		try {
			/*
				Cipher Format:
					Delimiter: |
					Part 1: Header [ PTFBP ]
					Part 2: Cipher Timestamp
					Part 3: Encryption algorithm
					Part 4: Cipher with [ PT ] prepended.
			*/
			
			text = 'PTFBP|' + key_timestamp + '|' + this.config.chats[chat_index].encryption + '|PT' + Cipher.encrypt(text, key_cipher, this.config.chats[chat_index].encryption);
			
			// Change the key if the interval has passed
			this.changeKey(chat_index, key_timestamp);
		} catch (err) {
			// OOooppss!
		}
		
		return text;
	},
	
	/* And here we decrypt stuff */
	decrypt: function (data, chat_index) {
		// Get the user's id.
		var user_id = this.config.chats[chat_index].user_id;
		
		// Get the message's timestamp. The timestamp helps us retrieve the decryption key.
		var timestamp_index = this.getKeyIndex(chat_index, data.timestamp);
		
		/*
			If this is the first message for this chat, there will be no encryption/decryption keys.
			Or, if the current timestamp was not found in our collection.
		*/
		if (0 == this.config.chats[chat_index].keys.length || -1 == timestamp_index) {
			/*
				This part is a little bit tricky.
				Since we make an async ajax call to the server for the decryption key, we cannot decrypt the message
				on the fly. So what we do is enclose the encrypted message in a tag and add a class to it in order to
				identify and decrypt it once the decryption key arrives.
			*/
			
			this.getKeys(chat_index, data.timestamp);
			
			// Return the original text.
			return data.plain;
		} else {
			text = Cipher.decrypt(data.cipher, this.config.chats[chat_index].keys[timestamp_index].cipher, data.algorithm);
			return text;
		}
	},
	
	/* Store a cipher pair. */
	storeCipher: function (key_cipher, key_timestamp, chat_index) {
		var user_id = this.config.chats[chat_index].user_id;
		
		jQuery.ajax({
			url: this.config.domain + 'keys/set/u/' + user_id + '/k/'+ key_timestamp +'/e/' + PHP_Functions.urlencode(key_cipher) + '/',
			dataType: 'json',
			cache: false,
			type: 'GET',
			crossDomain: true,
			success: function(data) {
				if (null != data) {
					if (data.success) {
						/* Chill out */
					} else {
						alert(data.message);
					}
				} else {
					alert("TANIGER: Could not send encryption keys to the server.\n\nIf the problem persists please disable the protection and report this to the administrator");
				}
			}
		});
	},
	
	/*
		This function checks if an encryption key has expired and changes it accordingly.
	*/
	changeKey: function (chat_index, key_timestamp) {
		var timeout = PHP_Functions.time() + this.config.TNGTime - this.config.key_expire;
		if (key_timestamp > timeout) { return false; }
		
		/* We generate a cipher key and a key timestamp. */
		var key_cipher = this.generateKey(this.config.key_size);
		var key_timestamp = PHP_Functions.time() + this.config.TNGTime;
		
		/* Add the generated pair to the user's chat. */
		this.addCipher(key_cipher, key_timestamp, chat_index, false);
		/* And send it for storage. */
		this.storeCipher(key_cipher, key_timestamp, chat_index);
	},
	
	/* Add a cipher pair (cipher / timestamp) to a chat. */
	addCipher: function (key_cipher, key_timestamp, chat_index, sort_by_timestamp) {
		this.config.chats[chat_index].keys.push({ timestamp: key_timestamp, cipher: key_cipher });
		
		// Sort keys if required. Tha latest key will be at the last position of the array
		if (sort_by_timestamp) {
			this.sortKeys(chat_index);
		}
		
		// Broadcast the key to the background.
		this.broadcast('add-key', { user_id: this.config.chats[chat_index].user_id, timestamp: key_timestamp, cipher: key_cipher, sort: sort_by_timestamp });
	},
	
	/* Generate a cipher key. */
	generateKey: function (l) {
		var k = '';
		var s = this.config.CHARACTER_SET.length - 1;
		
		for (var i = 0; i < l; i++) {
			k += this.config.CHARACTER_SET.charAt(PHP_Functions.rand(0, s));
		}
		return k;
	},
	
	/* Retrieve the decryption key for the specific timestamp. */
	getKeys: function (chat_index, key_timestamp) {
		var user_id = this.config.chats[chat_index].user_id;
		jQuery.ajax({
			url: this.config.domain + 'keys/get/u/' + user_id + '/k/'+ key_timestamp + '/',
			dataType: 'json',
			cache: false,
			type: 'GET',
			crossDomain: true,
			success: function(data) {
				if (data != null) {
					if (data.success) {
						/* OK, we got the decryption key. Add it to the collection. */
						Taniger.addCipher(data.password, key_timestamp, chat_index, true);
					} else {
						if (data.message.length > 0) {
							alert(data.message);
						}
					}
				} else {
					alert("TANIGER: Could not get decryption keys from the server.\n\nIf the problem persists please disable the protection and report this to the administrator");
				}
			}
		});
	},
	
	/* This function processes the input cipher and returns an object with the timestamp, the text and the algorithm. */
	processCipher: function (text) {
		var parts = text.split('|');
		if (4 == parts.length && 
				'PTFBP' == parts[0] &&
				PHP_Functions.is_numeric(parts[1]) &&
				PHP_Functions.is_numeric(parts[2]) &&
				'PT' == parts[3].substr(0, 2)) {
					
					return { timestamp: parseInt(parts[1]), cipher: parts[3].substr(2), algorithm: parseInt(parts[2]), plain: text };
		}
		
		return false;
	},
	
	/* Detect the user from his cipher */
	getUserFromCipher: function(obj) {
		var user_url = '';
		
		var box = jQuery(obj).closest('.fbDockChatTabFlyout');
		if (box.length == 1) {
			// It's a tabbed dialog.
			var selected_user = jQuery(box).find('h4 a');
		} else {
			var selected_user = jQuery('#webMessengerHeaderName a');
		}
		
		if (1 == selected_user.length) {
			user_url = jQuery(selected_user).attr('href');
		}
		
		return Taniger.getChatIndex(0, user_url);
	},
	
	/* This function detects and decrypts any messages */
	decryptMessages: function() {
		jQuery("p:contains('PTFBP'), div:contains('PTFBP'), span:contains('PTFBP')").each(function() {
			if (jQuery(this).children().size() == 0) {
				// Process the encrypted text
				var data = Taniger.processCipher(jQuery(this).text());
				if (data === false) { return true; }  // break
				
				// .. get the user's position in the array
				var chat_index = Taniger.getUserFromCipher(this);
				if (chat_index == -1) { return true; }  // break
				// .. and decrypt it.
				var text = Taniger.decrypt(data, chat_index);
				jQuery(this).text(text);
			}
		});
	},
	
	/* Remove any buttons etc */
	clearInterface: function() {
		jQuery('.taniger-interface').remove();
		jQuery('textarea[taniger-user-id]').removeAttr('taniger-user-id');
	},
	
	isDefined: function (v) {
		return (typeof v != 'undefined');
	}
};

// Hey! Ho! Let's Go!
Taniger.init();