;(function (win,doc) {

  function run() {
    if (animationInProgress && !win.humane.forceNew) return;
    if (!queue.length) { remove(); return; }
    animationInProgress = true;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(function(){ // allow notification to stay alive for timeout
      if (!eventing) {
        on (doc.body,'mousemove',remove);
        on (doc.body,'click',remove);
        on (doc.body,'keypress',remove);
        on (doc.body,'touchstart',remove);
        eventing = true;
        if(!win.humane.waitForMove) remove();
      }
    }, win.humane.timeout);

    var next = queue.shift();
    var type = next[0];
    var content = next[1];
    if ( isArray(content) ) content = '<ul><li>' + content.join('<li>') + '</ul>';

    humaneEl.innerHTML = content;
    animate(type,1);
  }



}( window, document ));

;(function (win,doc) {
    var trumpetEl = null;
    var animationInProgress = false;
    var useFilter = /msie [678]/i.test(navigator.userAgent); // sniff, sniff
    var isSetup = false;
    var message = "";
    
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

      setup();  checkMessages();
    });
    

    function remove() {
      animate(0);
    }
    

    function setup() {
    theme = doc.createElement('link');
    theme.rel = 'stylesheet';
    theme.id = 'webmaster-messaging-theme';
    theme.href = "static/jackedup.css"
    doc.body.appendChild(theme);

      trumpetEl = doc.createElement('div');
      trumpetEl.id = 'trumpet';
      trumpetEl.className = 'trumpet';
      doc.body.appendChild(trumpetEl);
      on (trumpetEl,'click',function () {
          remove()
      });
      isSetup = true;
    }
    
    
    function end(){
      setTimeout(function(){
        animationInProgress = false;
        trumpetEl.className = "trumpet";
        trumpetEl.innerHTML = "";
        createCookie("trumpet-message", message);
        message = ""

      },500);
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
          humaneEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = opacity*100;
        }
      }
      else {
        return function (opacity) { humaneEl.style.opacity = String(opacity); }
      }
    }());

    function jsAnimateOpacity(type,level){
      var interval;
      var opacity;

      if (level === 1) {
        opacity = 0;
        humaneEl.className = "humane humane-js-animate humane-" + type;
        if (humaneEl.filters) humaneEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity = 0; // reset value so hover states work

        if (win.humane.forceNew) {
          opacity = useFilter
            ? humaneEl.filters.item('DXImageTransform.Microsoft.Alpha').Opacity/100|0
            : humaneEl.style.opacity|0;
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
            humaneEl.className = humaneEl.className.replace(" humane-js-animate","");
            clearInterval(interval);
            end();
          }
        }, 100 / 20);
      }
    }


    checkMessages = function() { 
        var xmlhttp;

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
              if (message_nodes.length>0){
                    new_message = message_nodes[0].firstChild.data;
                    if (new_message != message){
                        trumpetEl.innerHTML = message_nodes[0].firstChild.data;
                        animate(1);
                        
                    } 
                    window.setTimeout(checkMessages, 10000);
                    
              }
                      

        

          }
        }
        xmlhttp.open("GET","/3.xml",true);
        xmlhttp.send()
        };

    
    




 }( window, document ));