;(function (win,doc) {
    var trumpetEl = null;
    var animationInProgress = false;
    var useFilter = /msie [678]/i.test(navigator.userAgent); // sniff, sniff
    var message = "";
    var message_dismissed = "";
    var animate_status = 0;
    var xmlhttp;
    var on, off
    if ('addEventListener' in win) {
      on  = function (obj,type,fn) { obj.addEventListener(type,fn,false)    };
      off = function (obj,type,fn) { obj.removeEventListener(type,fn,false) };
    }
    else {
      on  = function (obj,type,fn) { obj.attachEvent('on'+type,fn) };
      off = function (obj,type,fn) { obj.detachEvent('on'+type,fn) };
    }
    
    on (win,'load',function () {
      var transitionSupported = ( function (style) {
        var prefixes = ['MozT','WebkitT','OT','msT','KhtmlT','t'];
        for(var i = 0, prefix; prefix = prefixes[i]; i++) {
          if (prefix+'ransition' in style) return true;
        }
        return false;
      }(doc.body.style));
      if (!transitionSupported) animate = jsAnimateOpacity; // use js animation when no transition support
      trumpet_script = document.getElementById("trumpet");
      if (trumpet_script != null){
          data_message = trumpet_script.getAttribute("data-message");
          if (data_message != null){
              message = data_message;
          }
      }
      if(message != ""){
        setup();
      }
    });
    

	function murmurhash3_32_gc(key, seed) {
		var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

		remainder = key.length & 3; // key.length % 4
		bytes = key.length - remainder;
		h1 = seed;
		c1 = 0xcc9e2d51;
		c2 = 0x1b873593;
		i = 0;

		while (i < bytes) {
		  	k1 = 
		  	  ((key.charCodeAt(i) & 0xff)) |
		  	  ((key.charCodeAt(++i) & 0xff) << 8) |
		  	  ((key.charCodeAt(++i) & 0xff) << 16) |
		  	  ((key.charCodeAt(++i) & 0xff) << 24);
			++i;

			k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
			k1 = (k1 << 15) | (k1 >>> 17);
			k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

			h1 ^= k1;
	        h1 = (h1 << 13) | (h1 >>> 19);
			h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
			h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
		}

		k1 = 0;

		switch (remainder) {
			case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
			case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
			case 1: k1 ^= (key.charCodeAt(i) & 0xff);

			k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
			k1 = (k1 << 16) | (k1 >>> 16);
			k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
			h1 ^= k1;
		}

		h1 ^= key.length;

		h1 ^= h1 >>> 16;
		h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= h1 >>> 13;
		h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
		h1 ^= h1 >>> 16;

		return h1 >>> 0;
	}
    function setup() {
        theme = doc.createElement('style');
        //theme.type = 'text/css';
        //theme.setAttribute("rel", "stylesheet")
        theme.setAttribute("type", "text/css")
        //theme.setAttribute("href", "trumpet.css")
        style = ".trumpet { position: absolute; -moz-transition: all 0.6s ease-in-out; -webkit-transition: all 0.6s ease-in-out; -ms-transition: all 0.6s ease-in-out; -o-transition: all 0.6s ease-in-out; transition: all 0.6s ease-in-out; z-index: -1; font-family: Helvetica Neue, Helvetica, san-serif; font-size: 18px; top: -50px; left: 0; opacity: 0; filter: progid:dximagetransform.microsoft.alpha(Opacity=0); width: 100%; color: #222; padding: 5px; text-align: center; background-color: #999; border-bottom: 1px solid #777; } .trumpet.trumpet-animate, .trumpet.trumpet-js-animate { z-index: 100000; top: 0px; } .trumpet.trumpet-animate { opacity: 1; filter: progid:dximagetransform.microsoft.alpha(Opacity=100); } .trumpet.trumpet-animate:hover { opacity: 0.7; filter: progid:dximagetransform.microsoft.alpha(Opacity=70); } .trumpet.trumpet-js-animate { opacity: 1; filter: progid:dximagetransform.microsoft.alpha(Opacity=100); } .trumpet.trumpet-js-animate:hover { opacity: 0.7; filter: progid:dximagetransform.microsoft.alpha(Opacity=70); } ";
        if(theme.styleSheet){
            theme.styleSheet.cssText = style;
        }
        else{
            theme.innerHTML = style;
        }
        document.getElementsByTagName("head")[0].appendChild(theme);
          trumpetEl = doc.createElement('div');
          trumpetEl.id = 'trumpet_message';
          trumpetEl.className = 'trumpet';
          document.getElementsByTagName("body")[0].appendChild(trumpetEl);
          message_dismised = readCookie("trumpetapp_dm");
          on (trumpetEl,'click',function () {
              animate(0);
              message_dismissed = murmurhash3_32_gc(message,1)+"";
              createCookie("trumpetapp_dm",message_dismissed);
          });
          setTimeout(showMessage,1000);
          
          
      
    }
        
    function createCookie(name, value) {
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + 1);
        var c_value=escape(value) + "; expires="+exdate.toUTCString();
        document.cookie = name + "=" + value + "; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function animate (level) {
      animate_status = level;
      if(level === 1){
        trumpetEl.className = "trumpet trumpet-animate";
      }
      else {
        trumpetEl.className = trumpetEl.className.replace(" trumpet-animate","");
        end();
      }
    }

    // if CSS Transitions not supported, fallback to JS Animation
    var setOpacity = (function(){
      if (useFilter) {
        return function(opacity){
          trumpetEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity*100;
        }
      }
      else {
        return function (opacity) { trumpetEl.style.opacity = String(opacity); }
      }
    }());

    function jsAnimateOpacity(level){
      var interval;
      var opacity;
      animate_status = level;

      if (level === 1) {
        opacity = 0;
        trumpetEl.className = "trumpet trumpet-js-animate";
        if (trumpetEl.filters) trumpetEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = 0; // reset value so hover states work

        if (win.trumpet.forceNew) {
          opacity = useFilter
            ? trumpetEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity/100|0
            : trumpetEl.style.opacity|0;
        }
        interval = setInterval(function(){
          if (opacity < 1) {
            opacity += 0.1;
            if (opacity > 1) opacity = 1;
            setOpacity(opacity);
          }
          else {
            clearInterval(interval);
          }
        }, 100 / 20);
      }
      else {
        opacity = 1;
        interval = setInterval(function(){
          if(opacity > 0) {
            opacity -= 0.1;
            if (opacity < 0) opacity = 0;
            setOpacity(opacity);
          }
          else {
            trumpetEl.className = trumpetEl.className.replace("trumpet-js-animate","");
            clearInterval(interval);
            end();
          }
        }, 100 / 20);
      }
    }   
    
    function end(){
      setTimeout(function(){
        trumpetEl.className = "trumpet";
        trumpetEl.innerHTML = "";
        message = "";

      },500);
    }
    

    showMessage = function(){
        if (message_dismissed != murmurhash3_32_gc(message,1)+""){
            trumpetEl.innerHTML = message;
            animate(1);            
        }
        
    }
    
 }( window, document ));