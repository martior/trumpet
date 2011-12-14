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
    
    //code from: http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
    function getInternetExplorerVersion()
  // Returns the version of Internet Explorer or a -1
  // (indicating the use of another browser).
  {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
      var ua = navigator.userAgent;
      var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null)
        rv = parseFloat( RegExp.$1 );
    }
    return rv;
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
          message_dismissed = readCookie("trumpetapp_dm");
          on (trumpetEl,'click',function () {
              animate(0);
              message_dismissed = message;
              createCookie("trumpetapp_dm",message);
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
        if (message_dismissed != message){
            trumpetEl.innerHTML = message;
            animate(1);            
        }
        
    }
    
 }( window, document ));