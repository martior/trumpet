;(function (win,doc) {
    var trumpetEl = null;
    var animationInProgress = false;
    var useFilter = /msie [678]/i.test(navigator.userAgent); // sniff, sniff
    var message = "";
    var message_timestamp = "";
    var message_dismissed_timestamp = "";
    var animate_status = 0;
    var zone_id = 0;
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
          data_zone = trumpet_script.getAttribute("data-zone");
          if (data_zone != null){
              zone_id = data_zone;
          }
      }
      if(zone_id != 0){
        setup();
      }
    });
    
    

    function setup() {
        theme = doc.createElement('style');
        theme.type = 'text/css';
        theme.innerHTML = "html,body{height:100%;}\
        .trumpet{position:fixed;-moz-transition:all 0.6s ease-in-out;-webkit-transition:all 0.6s ease-in-out;-ms-transition:all 0.6s ease-in-out;-o-transition:all 0.6s ease-in-out;transition:all 0.6s ease-in-out;z-index:-1;}\
        .trumpet.trumpet-animate,.trumpet.trumpet-js-animate{z-index:100000;}\
        .trumpet{font-family:Helvetica Neue,Helvetica,san-serif;font-size:18px;letter-spacing:-1px;top:20px;left:30%;opacity:0;filter:progid:dximagetransform.microsoft.alpha(Opacity=0);width:40%;color:#222;padding:10px;text-align:center;background-color:#999;border:1px solid #777;-moz-border-radius:13px;-webkit-border-radius:13px;-ms-border-radius:13px;-o-border-radius:13px;border-radius:13px;-moz-box-shadow:0 1px 2px rgba(0, 0, 0, 0.5);-webkit-box-shadow:0 1px 2px rgba(0, 0, 0, 0.5);-ms-box-shadow:0 1px 2px rgba(0, 0, 0, 0.5);-o-box-shadow:0 1px 2px rgba(0, 0, 0, 0.5);box-shadow:0 1px 2px rgba(0, 0, 0, 0.5);-moz-transform:translatey(-100px);-webkit-transform:translatey(-100px);-ms-transform:translatey(-100px);-o-transform:translatey(-100px);transform:translatey(-100px);}\
        .trumpet p,.trumpet ul{margin:0;padding:0;}\
        .trumpet ul{list-style:none;}\
        .trumpet.trumpet-info{background-color:#fff;color:#fff;text-shadow:0 -1px 1px rgba(0, 0, 0, 0.35);}\
        .trumpet.trumpet-success{background-color:#64ff64;color:#fff;text-shadow:0 -1px 1px rgba(0, 0, 0, 0.35);}\
        .trumpet.trumpet-error{background-color:#ee5f5b;color:#fff;text-shadow:0 -1px 1px rgba(0, 0, 0, 0.35);}\
        .trumpet.trumpet-animate{opacity:1;filter:progid:dximagetransform.microsoft.alpha(Opacity=100);-moz-transform:translatey(0);-webkit-transform:translatey(0);-ms-transform:translatey(0);-o-transform:translatey(0);transform:translatey(0);}\
        .trumpet.trumpet-animate:hover{opacity:0.7;filter:progid:dximagetransform.microsoft.alpha(Opacity=70);}\
        .trumpet.trumpet-js-animate{opacity:1;filter:progid:dximagetransform.microsoft.alpha(Opacity=100);-moz-transform:translatey(0);-webkit-transform:translatey(0);-ms-transform:translatey(0);-o-transform:translatey(0);transform:translatey(0);}\
        .trumpet.trumpet-js-animate:hover{opacity:0.7;filter:progid:dximagetransform.microsoft.alpha(Opacity=70);}\
        "
        doc.body.appendChild(theme);

          trumpetEl = doc.createElement('div');
          trumpetEl.id = 'trumpet_message';
          trumpetEl.className = 'trumpet';
          doc.body.appendChild(trumpetEl);
          message_dismissed_timestamp = readCookie("trumped_dt");
          on (trumpetEl,'click',function () {
              animate(0);
              message_dismissed_timestamp = message_timestamp;
              createCookie("trumped_dt",message_timestamp);
          });
      
          if (window.XMLHttpRequest)
            {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp=new XMLHttpRequest();
            }
          else
            {// code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }

          xmlhttp.onreadystatechange=function()
          {
          if (this.readyState==4 && this.status==200)
            {
                var message_nodes = this.responseXML.getElementsByTagName("message");
                if (message_nodes.length>0 && message_nodes[0].firstChild != null){
                      message_text = message_nodes[0].getElementsByTagName("message_text")
                      new_message_timestamp = message_nodes[0].getElementsByTagName("message_timestamp")[0].firstChild.data;
                      new_message = message_text[0].firstChild.data;
                      if (new_message != message){
                          if (animate_status == 1){
                              animate(0);
                              setTimeout(function(new_message,message_timestamp){
                                  showMessage(new_message,new_message_timestamp)
                              },500);

                          }
                          else{
                              showMessage(new_message,new_message_timestamp)                        }  
                          }  
                }
                else{
                    animate(0);
                }
              window.setTimeout(checkMessages, 15000);                      
            }
          }
        checkMessages();          
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

    function jsAnimateOpacity(type,level){
      var interval;
      var opacity;
      animate_status = level;

      if (level === 1) {
        opacity = 0;
        trumpetEl.className = "trumpet trumpet-js-animate trumpet-" + type;
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
        message_timestamp = "";

      },500);
    }
    

    showMessage = function(new_message,new_message_timestamp){
        if (message_dismissed_timestamp != new_message_timestamp){
            message = new_message;
            message_timestamp = new_message_timestamp;
            trumpetEl.innerHTML = new_message;
            animate(1);            
        }
        
    }
    
    checkMessages = function() { 
        xmlhttp.open("GET","http://trumpetapp.appspot.com/"+zone_id+".xml",true);
        xmlhttp.send()
    }
 }( window, document ));