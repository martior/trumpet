// Copyright (C) 2012 Martin Reistadbakk
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
CloudFlare.define("trumpet", ["cloudflare/jquery1.7", "cloudflare/user", "cloudflare/dom", "cloudflare/path", "cloudflare/console", "trumpet/config"], function($, user, dom, path, console, _config) {
    var Trumpet = function SopaProtest(config) {
            this.trumpetEl = null;
            this.useFilter = /msie [678]/i.test(navigator.userAgent); // sniff, sniff
            this.message_dismissed = "";
            this.animate_status = 0;
            this.config = config
            if (config.onCloudflare) {
                this.cookie = "__trumpetapp_dm"
            }
        }
    var cdnPath = "//ajax.cloudflare.com/cdn-cgi/nexp/";

    var config = $.extend({
        selector: "header, h1, h2, h3, p, li, span, em",
        onCloudflare: false,
        regex: '.{5}'
    }, _config)


    var trumpet = new Trumpet(config)

    
    //begin extend
    $.extend(Trumpet.prototype, {

        activate: function() {
            if (this.config.message != "") {
                this.setup();
            }
        }

        styleSheet : function(){
            return $('<link rel="stylesheet" media="screen" href="' + cdnPath + 'stylesheets/trumpet.css">');
        }

        murmurhash3_32_gc: function(key, seed) {
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

        setup: function() {
            var transitionSupported = (function(style) {
                var prefixes = ['MozT', 'WebkitT', 'OT', 'msT', 'KhtmlT', 't'];
                for (var i = 0, prefix; prefix = prefixes[i]; i++) {
                    if (prefix + 'ransition' in style) return true;
                }
                return false;
            }(doc.body.style));
            if (!transitionSupported){
                this.animate = this.jsAnimateOpacity; // use js animation when no transition support
            }

            this.trumpetEl = doc.createElement('div');
            this.trumpetEl.id = 'trumpet_message';
            this.trumpetEl.className = 'trumpet';
            document.getElementsByTagName("body")[0].appendChild(this.trumpetEl);
            this.message_dismissed = this.readCookie();
            on(this.trumpetEl, 'click', function() {
                this.animate(0);
                this.message_dismissed = this.murmurhash3_32_gc(message, 1) + "";
                this.createCookie(this.message_dismissed);
            });
            setTimeout(showMessage, 1000);



        }

        createCookie: function(value) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + 1);
            var c_value = escape(value) + "; expires=" + exdate.toUTCString();
            document.cookie = this.cookie + "=" + value + "; path=/";
        }

        readCookie: function (name) {
            var nameEQ = this.cookie + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        animate: function (level) {
            this.animate_status = level;
            if (level === 1) {
                this.trumpetEl.className = "trumpet trumpet-animate";
            } else {
                this.trumpetEl.className = this.trumpetEl.className.replace(" trumpet-animate", "");
                end();
            }
        }

        // if CSS Transitions not supported, fallback to JS Animation
        setOpacity: function() {
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

        jsAnimateOpacity: function(level) {
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
        }

        end: function () {
            setTimeout(function() {
                this.trumpetEl.className = "trumpet";
                this.trumpetEl.innerHTML = "";
                this.config.message = "";

            }, 500);
        }


        showMessage = function() {
            if (this.message_dismissed != this.murmurhash3_32_gc(message, 1) + "") {
                this.trumpetEl.innerHTML = message;
                this.animate(1);
            }

        }
    }); //end extend
    if (!window.jasmine) {
        $("head").append(trumpet.styleSheet());
        trumpet.activate();
    }

    return trumpet
});
