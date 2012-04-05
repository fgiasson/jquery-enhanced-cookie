/**

# $.ms, inspired by ms.js, https://github.com/guille/ms.js

No more painful `setTimeout(fn, 60 * 4 * 3 * 2 * 1 * Infinity * NaN * '☃')`.

    $.ms('2d')      // 172800000
    $.ms('1.5h')    // 5400000
    $.ms('1h')      // 3600000
    $.ms('1m')      // 60000
    $.ms('5s')      // 5000
    $.ms('500ms')   // 500
    $.ms('100')     // 100
    $.ms(100)       // 100

**/
(function ($) {
    /*
	* we use ms widely, so ensure we really have it
	*/
	if (typeof $.ms == "undefined") {
		var r = /(\d*.?\d+)([mshd]+)/ , _ = { }, m;

		_.ms = 1;
		_.s = 1000;
		_.m = _.s * 60;
		_.h = _.m * 60;
		_.d = _.h * 24;

		$.ms = function(s) {
			return +s || ((m = r.exec(s.toLowerCase())) ? m[1] * _[m[2]] : NaN);
		};
	}

	/*
	* maxSize - Defines the maximum number of bytes that can be saved in a single cookie. (default: 3000)
	* maxNumber - The maximum number of cookies that can be created for a single domain name. (default: 20)
	* local - Tells the extended Cookie plugin to use the HTML5's localStorage capabilities of the browser instead of a cookie to save that value. (default: true)
	*/
	$.cookie = function (key, value, options) {

		// Check if localStorage of HTML5 exists in this browser
		var isStorageAvailable,
			_cacheKey = "-cachettl";
		try {
			isStorageAvailable = window.localStorage;
			isStorageAvailable.setItem("isStorageAvailable", "true");
			if (isStorageAvailable.getItem("isStorageAvailable") != "true") {
				isStorageAvailable = false;
			}
		} catch (e) { }

		// if there's a TTL that's expired, flush this item
		var ttl = localStorage.getItem(key + _cacheKey);
		if (ttl && ttl < +new Date()) {
			localStorage.removeItem(key);
			localStorage.removeItem(key + _cacheKey);
		}

		// Check if the user wants to create or delete a cookie.
		if (arguments.length > 1 && String(value) !== "[object Object]") {
			options = $.extend({}, options);

			// Set the default value of the maxSize option if it is not yet defined.
			if (options.maxSize == undefined) {
				options.maxSize = 3000;
			}

			// Set the default value of the maxNumber option if it is not yet defined.
			if (options.maxNumber == undefined) {
				options.maxNumber = 20;
			}

			// Set the usage of the local storage to true by default
			if (options.local == undefined) {
				options.local = true;
			}

			// Check if the user tries to delete the cookie
			if (value === null || value === undefined) {
				// If the localStorage is available, and if the user requested its usage, then we first
				// try to delete it from that place
				if (options.local && isStorageAvailable != false) {
					localStorage.removeItem(key);
				}
				var exists;
				// Even if the localStora was used, we try to remove some possible old cookies
				// Delete all possible chunks for that cookie
				for (var i = 0; i < options.maxNumber; i++) {
					if (i == 0) {
						// The first chunk doesn't have the chunk indicator "---"
						exists = $.chunkedcookie(key);
					} else {
						exists = $.chunkedcookie(key + "---" + i);
					}

					if (exists != null) {
						$.chunkedcookie(key + "---" + i, null, options);
					} else {
						break;
					}
				}
			} else {
				// If the localStorage is available, and if the user requested its usage,
				// then we create that value in the localStorage of the browser (and not in a cookie)
				if (options.local && isStorageAvailable != false) {
					localStorage.setItem(key, value);
					if (typeof options.expires === 'number') {
						var ms = options.expires, t = options.expires = new Date();
						t.setTime(t.getTime() + ms);
						localStorage.setItem(key + _cacheKey, options.expires.toUTCString());
					}
				} else {
					// The user tries to create a new cookie

					// Chunk the input content
					var exp = new RegExp(".{1," + options.maxSize + "}", "g");

					if (value.match != undefined) {
						var chunks = value.match(exp);

						// Create one cookie per chunk
						for (var i = 0; i < chunks.length; i++) {
							if (i == 0) {
								$.chunkedcookie(key, chunks[i], options);
							} else {
								$.chunkedcookie(key + "---" + i, chunks[i], options);
							}
						}
					} else {
						// The value is probably a number, so we add it to a single cookie
						$.chunkedcookie(key, value, options);
					}
				}
			}

			return (null);
		}

		// Check if options have been given for a cookie retreival operation
		if (options == undefined) {
			if (arguments.length > 1 && String(value) === "[object Object]") {
				options = value;
			} else {
				options = {};
			}

			if (options.maxNumber == undefined) {
				options.maxNumber = 20;
			}

			if (options.local == undefined) {
				options.local = true;
			}
		}

		// If localStorage is available, we first check if there exists a value for that name.
		// If no value exists in the localStorage, then we continue by checking in the cookies
		// This second checkup is needed in case that a cookie has been created in the past,
		// using the old cookie jQuery plugin.
		if (isStorageAvailable != false) {
			value = localStorage.getItem(key);

			if (value != undefined && value != null) {
				return (value);
			}
		}

		value = "";

		var val;

		// The user tries to get the value of a cookie
		for (var i = 0; i < options.maxNumber; i++) {
			// Check if the next chunk exists in the browser
			if (i == 0) {
				val = $.chunkedcookie(key);
			} else {
				val = $.chunkedcookie(key + "---" + i);
			}

			// Append the value
			if (val != null) {
				value += val;
			} else {
				// If the value is null, and we are looking at the first chunk, then
				// it means that the cookie simply doesn't exist
				if (i == 0) {
					return (null);
				}

				break;
			}
		}

		// Return the entire content from all the cookies that may have been used for that value.
		return (value);
	};

	$.chunkedcookie = function (key, value, options) {

		// key and at least value given, set cookie...
		if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
			options = $.extend({}, options);

			if (value === null || value === undefined) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				//var days = options.expires, t = options.expires = new Date();
				//t.setDate(t.getDate() + days);
				var ms = options.expires, t = options.expires = new Date();
				t.setTime(t.getTime() + ms);
			}

			value = String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path ? '; path=' + options.path : '',
				options.domain ? '; domain=' + options.domain : '',
				options.secure ? '; secure' : ''
			].join(''));
		}

		// key and possibly options given, get cookie...
		options = value || {};
		var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

		var pairs = document.cookie.split('; ');
		for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
			if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
		}
		return null;
	};
})(jQuery);