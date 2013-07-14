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

// Taniger Configuration.
var TanigerConfig = {
	/* You can edit these */
	domain: 'https://www.taniger.com/',
	key_size: 128, /* Be sure to change the database field size if you set this to anything > 128 */
	CHARACTER_SET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()~[]|}{;?,._', /* Not recommended to change but you are free to */
	key_expire: 300, /* How often the key is changed (in seconds). Carefull with that. */
	
	/* But you can't touch any of these */
	chats: new Array(),
	disabled: true,
	logged: false,
	TNGTime: 0,
	monitorInterval: 1000,
	fb_id: null,			/* facebook user id */
	taniger_id: null,	/* taniger user id. must be the same as fb_id */
	algorithms: new Array({ id: 1, name: '3-DES' }, { id: 2, name: 'AES' }, { id: 4, name: 'DES' }, { id: 8, name: 'RC4' }, { id: 16, name: 'Rabbit' }),
	version: chrome.app.getDetails().version,
	browser: 'chrome'
};

var TanigerHandler = {
	/* This is a function to detect facebook open tabs */
	isFacebook: function(url) {
		url = url.toLowerCase();
		
		// I should change this to a regular expression ^_^
		var check = new Array('http://www.facebook.com', 'https://www.facebook.com');
		for (var i = 0; i < check.length; i++) {
			if (check[i] == url.substr(0, check[i].length)) { return true; }
		}
		return false;
	},
	
	/* This function is to broadcast any options/changes to other tabs */
	broadcast: function(controller, options, tab_id) {
		options.controller = controller;
		
		var page_icon = TanigerHandler.pageIcon();
		
		if (tab_id > 0) {
			chrome.tabs.sendMessage(tab_id, options, function(response) {
				// Nothing. - TODO.
			});
			
			chrome.pageAction.setIcon({ tabId: tab_id, path: page_icon });
		} else {
			chrome.tabs.query({ url: "*://www.facebook.com/*" }, function(tabs) {
				for (var i = 0; i < tabs.length; i++) {
					chrome.tabs.sendMessage(tabs[i].id, options, function(response) {
						// Nothing. - TODO.
					});
					
					// And update the icon.
					chrome.pageAction.setIcon({ tabId: tabs[i].id, path: page_icon });
				}
			});
		}
	},
	
	/* Receiver for the content broadcasts */
	receiver: function(options, tab_id) {
		if (this.isDefined(options.controller)) {
			switch (options.controller) {
				case 'config':
					this.isDefined(options.fb_id) && (TanigerConfig.fb_id = options.fb_id);
					this.isDefined(options.taniger_id) && (TanigerConfig.taniger_id = options.taniger_id);
					
					if (TanigerConfig.fb_id == null && TanigerConfig.taniger_id == null) {
						// Disable TANIGER
						
						// Change the status
						TanigerConfig.disabled = true;
						TanigerConfig.logged = false;
						TanigerConfig.chats = new Array();
						
						// Broadcast the new values
						TanigerHandler.broadcast('config', { disabled: TanigerConfig.disabled, logged: TanigerConfig.logged }, 0);
					}
					
					return { success: true }
					
					break;
				case 'get-config':
					return { controller: 'full-config', config: TanigerConfig };
					
					break;
				case 'add-chat':
					return this.addChat(options.data);
					
					break;
				case 'update-chat':
					return this.editChat(options);
					
					break;
				case 'add-key':
					return this.addKey(options);
					
					break;
			}
		}
	},
	
	/* Add an encryption key */
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
		TanigerConfig.chats[chat_index].keys.push({ timestamp: options.timestamp, cipher: key_cipher });
		
		// And sort if required
		if (this.isDefined(options.sort) && options.sort) {
			this.sortKeys(chat_index);
		}
		
		// broadcast the changes to the rest of the tabs.
		this.broadcast('add-key', { data: options }, 0);
	},
	
	/* Sort encryption keys */
	sortKeys: function(chat_index) {
		for (var i = 0; i < TanigerConfig.chats[chat_index].keys.length; i++) {
			for (var k = i + 1; k < TanigerConfig.chats[chat_index].keys.length; k++) {
				if (TanigerConfig.chats[chat_index].keys[i].timestamp > TanigerConfig.chats[chat_index].keys[k].timestamp) {
					tmp = TanigerConfig.chats[chat_index].keys[i];
					TanigerConfig.chats[chat_index].keys[i] = TanigerConfig.chats[chat_index].keys[k];
					TanigerConfig.chats[chat_index].keys[k] = tmp;
				}
			}
		}
	},
	
	/* Edit chat properties */
	editChat: function(options) {
		var user_id = 0;
		var user_url = '';
		
		// Either user_id OR user_url must ALWAYS exist.
		this.isDefined(options.user_id) && (user_id = options.user_id);
		this.isDefined(options.user_url) && (user_url = options.user_url);
		
		var chat_index = this.getChatIndex(user_id, user_url);
		if (chat_index == -1) { return { success: false }; }
		
		// Update properties
		this.isDefined(options.user_id) && (TanigerConfig.chats[chat_index].user_id = options.user_id);
		this.isDefined(options.user_url) && (TanigerConfig.chats[chat_index].user_url = options.user_url);
		this.isDefined(options.secure) && (TanigerConfig.chats[chat_index].secure = options.secure);
		this.isDefined(options.encryption) && (TanigerConfig.chats[chat_index].encryption = options.encryption);
		
		// Once all is complete, broadcast the change to the rest of the tabs
		this.broadcast('update-chat', { data: options }, 0);
		
		return { success: true };
	},
	
	/* Add a new chat if it does not exist */
	addChat: function(chat) {
		// If the chat already exists abort
		if (this.getChatIndex(chat.user_id, chat.user_url) != -1) { return false; }
		
		// Add it and update the rest of the open tabs
		TanigerConfig.chats.push(chat);
		
		// Once the chat has been added, broadcast it to the rest of the tabs
		this.broadcast('add-chat', { data: chat }, 0);
		
		return { success: true };
	},
	
	/* Search and return the index of the chats[] array that corresponds to the conversation with user_id or user_url. */
	getChatIndex: function(user_id, user_url) {
		for (var i = 0; i < TanigerConfig.chats.length; i++) {
			if (user_id > 0 && TanigerConfig.chats[i].user_id == user_id) { return i; }
			if (user_url.length > 0 && TanigerConfig.chats[i].user_url == user_url) { return i; }
		}
		return -1;
	},
	
	/* Search and return the index of the key from a conversation */
	getKeyIndex: function(chat_index, timestamp) {
		for (var i = 0; i < TanigerConfig.chats[chat_index].keys.length; i++) {
			if (TanigerConfig.chats[chat_index].keys[i].timestamp == timestamp) { return i; }
		}
		return -1;
	},
	
	/* This is to return the application's state */
	appState: function() {
		// Enabled and logged.
		if (!TanigerConfig.disabled && TanigerConfig.logged) { return 1; }
		// Disabled.
		if (TanigerConfig.disabled) { return 2; }
		// Enabled but not logged.
		if (!TanigerConfig.logged) { return 3; }
	},
	
	/* This is to decide which icon to use */
	pageIcon: function() {
		/*
			Green:		Enabled and logged
			Yellow: Enabled but not logged
			Red: 		Disabled.
		*/
		
		var state = this.appState();
		
		switch (state) {
			case 1:
				return 'images/taniger.png';
				break;
			case 2:
				return 'images/taniger_disabled.png';
				break;
			case 3:
				return 'images/taniger_not_logged.png';
				break;
		}
		return 'images/taniger_disabled.png';
	},
	
	/* This function is to verify if the user is logged in TANIGER */
	checkLogin: function() {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", TanigerConfig.domain + "check/login/browser/"+ TanigerConfig.browser +"/version/" + TanigerConfig.version, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var data = JSON.parse(xhr.responseText);
				
				if (data.success) {
					TanigerConfig.TNGTime = data.time - Math.floor(new Date().getTime() / 1000);
					TanigerConfig.taniger_id = data.taniger_id;
					TanigerConfig.logged = true;
					TanigerHandler.broadcast('config', { logged: true, TNGTime: TanigerConfig.TNGTime, enable: true, taniger_id: TanigerConfig.taniger_id }, 0);
					TanigerHandler.broadcast('validate', { id: TanigerConfig.fb_id }, 0);
				} else {
					if (data.message.length > 0) {
						alert(data.message);
					}
					TanigerHandler.shutdown();
				}
			}
		}
		xhr.send();
	},
	
	shutdown: function() {
		TanigerConfig.disabled = true;
		TanigerConfig.logged = false;
		
		TanigerHandler.broadcast('config', { disabled: TanigerConfig.disabled, logged: TanigerConfig.logged }, 0);
	},
	
	isDefined: function (v) {
		return (typeof v != 'undefined');
	}
};

/* Chrome event listeners */

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// Each time a facebook tab is being updated and has been completed.
	if (changeInfo.status == 'complete' && TanigerHandler.isFacebook(tab.url)) {
		// Show icon
		chrome.pageAction.show(tabId);
		
		// Change the icon and make sure monitoring is running.
		var run = !TanigerConfig.disabled && TanigerConfig.logged;
		TanigerHandler.broadcast('config', { tab_id: tab.id, enable: run, taniger_id: TanigerConfig.taniger_id }, 0);
		if (run) {
			TanigerHandler.broadcast('validate', { id: TanigerConfig.fb_id }, 0);
		}
	}
});

// Communication between content and background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var response = TanigerHandler.receiver(request);
	sendResponse(response);
});

// When the user clicks the page icon
chrome.pageAction.onClicked.addListener(function(tab) {
	// Change the status
	TanigerConfig.disabled = !TanigerConfig.disabled;
	// If the new value is true, change the logged flag as well to force a login check when it's re-enabled.
	TanigerConfig.disabled && (TanigerConfig.logged = false);
	
	// Broadcast the new values
	TanigerHandler.broadcast('config', { disabled: TanigerConfig.disabled, logged: TanigerConfig.logged }, 0);
	
	if (!TanigerConfig.disabled && !TanigerConfig.logged) {
		// Check if the user is logged
		TanigerHandler.checkLogin();
	}
});