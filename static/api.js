;(function (win,doc) {
  var on, off, isArray;
  if ('addEventListener' in win) {
    on  = function (obj,type,fn) { obj.addEventListener(type,fn,false)    };
    off = function (obj,type,fn) { obj.removeEventListener(type,fn,false) };
  }
  else {
    on  = function (obj,type,fn) { obj.attachEvent('on'+type,fn) };
    off = function (obj,type,fn) { obj.detachEvent('on'+type,fn) };
  }
  isArray = Array.isArray || function (obj) { return Object.prototype.toString.call(obj) === '[object Array]' };

  var eventing = false;
  var animationInProgress = false;
  var humaneEl = null;
  var timeout = null;
  var useFilter = /msie [678]/i.test(navigator.userAgent); // sniff, sniff
  var isSetup = false;
  var queue = [];

  on (win,'load',function () {
    var transitionSupported = ( function (style) {
      var prefixes = ['MozT','WebkitT','OT','msT','KhtmlT','t'];
      for(var i = 0, prefix; prefix = prefixes[i]; i++) {
        if (prefix+'ransition' in style) return true;
      }
      return false;
    }(doc.body.style));
    if (!transitionSupported) animate = jsAnimateOpacity; // use js animation when no transition support

    setup(); run();
  });

  function setup() {
    humaneEl = doc.createElement('div');
    humaneEl.id = 'humane';
    humaneEl.className = 'humane';
    doc.body.appendChild(humaneEl);
    isSetup = true;
  }

  function remove() {
    off (doc.body,'mousemove',remove);
    off (doc.body,'click',remove);
    off (doc.body,'keypress',remove);
    off (doc.body,'touchstart',remove);
    eventing = false;
    if (animationInProgress) animate(0);
  }

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

  function animate (type,level) {
    if(level === 1){
      humaneEl.className = "humane humane-" + type + " humane-animate";
    }
    else {
      humaneEl.className = humaneEl.className.replace(" humane-animate","");
      end();
    }
  }

  function end(){
    setTimeout(function(){
      animationInProgress = false;
      humaneEl.className = "humane";
      run();
    },500);
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

  function notifier (type) {
    return function (message) {
      queue.push( [type, message] );
      if(isSetup) run();
    }
  }

  win.humane = notifier('log');

  win.humane.log = notifier('log');
  win.humane.error = notifier('error');
  win.humane.info = notifier('info');
  win.humane.success = notifier('success');

  win.humane.timeout = 2500;
  win.humane.waitForMove = false;
  win.humane.forceNew = false;

}( window, document ));

;(function (win,doc) {
    theme = doc.createElement('link');
    theme.rel = 'stylesheet';
    theme.id = 'webmaster-messaging-theme';
    theme.href = "http://trumpetapp.appspot.com/static/jackedup.css"
    doc.body.appendChild(theme);
    humane.waitForMove = true;
    humane.timeout = 5000;
    function createCookie(name, value) {
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + 10);
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
              for (i = 0; i < message_nodes.length; i++) {
               			id = message_nodes[i].getElementsByTagName("key")[0].firstChild.data;
               			message = message_nodes[i].getElementsByTagName("value")[0].firstChild.data;
                        if (!readCookie("trumpet-"+id)){
                            createCookie("trumpet-"+id,true);
                            humane.info(message);
                            
                        }
               		}

          }
        }
        xmlhttp.open("GET","http://trumpetapp.appspot.com/api/messages",true);
        xmlhttp.send()
        window.setTimeout(checkMessages, 10000);
        };
    checkMessages()
    
    




 }( window, document ));