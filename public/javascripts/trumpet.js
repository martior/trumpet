// Copyright (C) 2012 Martin Reistadbakk
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

CloudFlare.define("trumpet", ["cloudflare/jquery1.7", "cloudflare/user", "cloudflare/dom", "cloudflare/path", "cloudflare/console", "trumpet/config"], function($, user, dom, path, console, _config) {

    if ('addEventListener' in window) {
      on  = function (obj,type,fn) { obj.addEventListener(type,fn,false)    };
      off = function (obj,type,fn) { obj.removeEventListener(type,fn,false) };
    }
    else {
      on  = function (obj,type,fn) { obj.attachEvent('on'+type,fn) };
      off = function (obj,type,fn) { obj.detachEvent('on'+type,fn) };
    }
    

    var Trumpet = function Trumpet(config) {
            this.trumpetEl = null;
            this.useFilter = /msie [678]/i.test(navigator.userAgent); // sniff, sniff
            this.message_dismissed = "";
            this.animate_status = 0;
            this.config = config
            this.cookie = "__trumpetapp_dm"
        }
    var trumpet = new Trumpet(_config)


    Trumpet.prototype.activate = function() {
        if (this.config.message != "") {
            this.setup();
        }
    }

    Trumpet.prototype.setup = function() {
        var theme = document.createElement('style');
        theme.setAttribute("type", "text/css")
        var style = ".trumpet { position: absolute; -moz-transition: all 0.6s ease-in-out; -webkit-transition: all 0.6s ease-in-out; -ms-transition: all 0.6s ease-in-out; -o-transition: all 0.6s ease-in-out; transition: all 0.6s ease-in-out; z-index: -1; font-family: Helvetica Neue, Helvetica, san-serif; font-size: 18px; top: -50px; left: 0; opacity: 0; filter: progid:dximagetransform.microsoft.alpha(Opacity=0); width: 100%; color: #DDD; padding: 5px; text-align: center; background-color: #333; border-bottom: 1px solid black; } .trumpet.trumpet-animate, .trumpet.trumpet-js-animate { z-index: 100000; top: 0px; } .trumpet.trumpet-animate { opacity: 1; filter: progid:dximagetransform.microsoft.alpha(Opacity=100); } .trumpet.trumpet-animate:hover { opacity: 0.7; filter: progid:dximagetransform.microsoft.alpha(Opacity=70); } .trumpet.trumpet-js-animate { opacity: 1; filter: progid:dximagetransform.microsoft.alpha(Opacity=100); } .trumpet.trumpet-js-animate:hover { opacity: 0.7; filter: progid:dximagetransform.microsoft.alpha(Opacity=70); } ";
        if(theme.styleSheet){
            theme.styleSheet.cssText = style;
        }
        else{
            theme.innerHTML = style;
        }
        document.getElementsByTagName("head")[0].appendChild(theme);

        var transitionSupported = (function(style) {
            var prefixes = ['MozT', 'WebkitT', 'OT', 'msT', 'KhtmlT', 't'];
            for (var i = 0, prefix; prefix = prefixes[i]; i++) {
                if (prefix + 'ransition' in style) return true;
            }
            return false;
        }(document.body.style));
        if (!transitionSupported){
            this.animate = this.jsAnimateOpacity; // use js animation when no transition support
        }

        this.trumpetEl = document.createElement('div');
        this.trumpetEl.id = 'trumpet_message';
        this.trumpetEl.className = 'trumpet';
        document.getElementsByTagName("body")[0].appendChild(this.trumpetEl);
        this.message_dismissed = this.readCookie();
        on (this.trumpetEl,'click',function () {
            trumpet.animate(0);
            trumpet.message_dismissed = trumpet.murmurhash3_32_gc(trumpet.config.message, 1) + "";
            trumpet.createCookie(trumpet.message_dismissed);
        });
        this.showMessage();

    }
    Trumpet.prototype.showMessage = function(self) {
        if (this.config.persistant || (this.message_dismissed != this.murmurhash3_32_gc(this.config.message, 1) + "")) {
            this.trumpetEl.innerHTML = this.config.message;
            this.animate(1);
        }

    }
        

    Trumpet.prototype.animate = function(level) {
        this.animate_status = level;
        if (level === 1) {
            this.trumpetEl.className = "trumpet trumpet-animate";
        } else {
            this.trumpetEl.className = this.trumpetEl.className.replace(" trumpet-animate", "");
            this.end();
        }
    }

    // if CSS Transitions not supported, fallback to JS Animation
    Trumpet.prototype.setOpacity = function() {
        if (this.useFilter) {
            return function(opacity) {
                this.trumpetEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity * 100;
            }
        } else {
            return function(opacity) {
                this.trumpetEl.style.opacity = String(opacity);
            }
        }
    }

    Trumpet.prototype.jsAnimateOpacity = function(level) {
        var interval;
        var opacity;
        this.animate_status = level;

        if (level === 1) {
            opacity = 0;
            this.trumpetEl.className = "trumpet trumpet-js-animate";
            if (this.trumpetEl.filters) this.trumpetEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = 0; // reset value so hover states work
            if (window.trumpet.forceNew) {
                opacity = this.useFilter ? this.trumpetEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity / 100 | 0 : this.trumpetEl.style.opacity | 0;
            }
            interval = setInterval(function() {
                if (opacity < 1) {
                    opacity += 0.1;
                    if (opacity > 1) opacity = 1;
                    this.setOpacity()(opacity);
                } else {
                    clearInterval(interval);
                }
            }, 100 / 20);
        } else {
            opacity = 1;
            interval = setInterval(function() {
                if (opacity > 0) {
                    opacity -= 0.1;
                    if (opacity < 0) opacity = 0;
                    this.setOpacity()(opacity);
                } else {
                    this.trumpetEl.className = this.trumpetEl.className.replace("trumpet-js-animate", "");
                    clearInterval(interval);
                    this.end();
                }
            }, 100 / 20);
        }
    },

    Trumpet.prototype.end = function () {
        setTimeout(function(self) {
            self.trumpetEl.className = "trumpet";
            self.trumpetEl.innerHTML = "";
            self.config.message = "";

        }, 500,this);
    }

    Trumpet.prototype.createCookie = function(value) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 1);
        var c_value = escape(value) + "; expires=" + exdate.toUTCString();
        document.cookie = this.cookie + "=" + value + "; path=/";
    }

    Trumpet.prototype.readCookie = function (name) {
        var nameEQ = this.cookie + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    Trumpet.prototype.murmurhash3_32_gc = function(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
            k1 = ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(++i) & 0xff) << 8) | ((key.charCodeAt(++i) & 0xff) << 16) | ((key.charCodeAt(++i) & 0xff) << 24);
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
        case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            k1 ^= (key.charCodeAt(i) & 0xff);

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
    
    if (!window.jasmine) {
        trumpet.activate();
    }

    return trumpet
});
