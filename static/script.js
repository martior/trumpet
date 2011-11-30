var current_playlist_item = null;
var current_date = null;
var sliding = false;
var paused_before_sliding = true;
var loggedin = false;
var update_server=true;
var summaries = {};

if ($("#loggedinuser").val()!=""){
    loggedin = true;
}

getAudio = function() {
    return $("#main_audio").get(0);
}


function createCookie(name, value) {
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


function playFromCurrentTime(audio,t) {             
    setTimeout(function(){
        try
          {
             audio.attr("currentTime",t);
             play();
          }
        catch(err)
          {
             playFromCurrentTime(audio,t);
          }
        },500); 
    }
    
function getTimeFromCookie(audio) {
    audio.attr("preload","auto");
    audio.get(0).load()
    id = audio.data('id');
    if (id == null){
        play()
        
        }
    else if (loggedin == true){
        $.get('user/progress',{file:$(audio).data('id')}, function(t) {
            if (t != "") {
                playFromCurrentTime(audio,t);
            }
            else{
                play()
            }                   
        });
    }
    else{
        t = readCookie("currentTime" + id);
        if (t != null) {
            playFromCurrentTime(audio,t);
        }
        else{
            play()
        }
        
    }
        
    

}

pause = function() {
    audio = getAudio();
    $("#playpause").val('Play');
    if (audio != null) {
        audio.pause();
    }
    return false;
}

play = function() {
    audio = getAudio();
    $("#playpause").val('Pause');
    if (audio != null) {
        audio.play();
    }
    return false;
}


playOrPause = function() {
    audio = getAudio();
    $("#playpause").val(audio.paused ? 'Pause': 'Play');
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
    return false;
}


prettyPrintNumber = function(number) {
    return ((number < 10) ? '0': '') + number;
};
prettyPrintTime = function(time) {
    var components = [];
    components[0] = prettyPrintNumber(Math.floor(time / 3600));
    components[1] = prettyPrintNumber(Math.floor((time % 3600) / 60));
    components[2] = prettyPrintNumber(Math.floor(time % 60));
    return components.join(':');
};

updateTime = function() {
    audio = getAudio();
    $("#time").html(prettyPrintTime(audio.currentTime) + " of " + prettyPrintTime(audio.duration));
    createCookie("currentTime" + $(audio).data('id'), Math.floor(audio.currentTime));
    if (loggedin == true){
        if (update_server==true){
        update_server = false;
        $.post('user/progress',{file:$(audio).data('id'),progress:Math.floor(audio.currentTime)});
        window.setTimeout(function() {
            update_server=true;
        }, 10000);
        }
        

    }
    if (sliding == false) {
        $("#scrubber").attr("max", Math.floor(audio.duration));
        $("#scrubber").attr("value", Math.floor(audio.currentTime));
    }
}


getPercentProg = function() {
    var audio = this;
    var endBuf = audio.buffered.end(0);
    var soFar = parseInt(((endBuf / audio.duration) * 100));
    $(this).siblings(".loadStatus").html(soFar + '%');
}

playPlaylistItem = function(playlist_item) {
    if (playlist_item.get(0) == null) {
        return;
    }
    if (current_playlist_item != null) {
        pause();
        current_playlist_item.removeClass("currentPlaylistItem");
    }
    current_playlist_item = playlist_item;
    createCookie("current_audio_id", current_playlist_item.attr('id'));
    if (loggedin == true){
        $.post('user/progress',{file:current_playlist_item.attr('id')});
    }
    current_playlist_item.addClass("currentPlaylistItem");
    $("#current").html(current_playlist_item.html());
    audio = $("#main_audio")
    audio.data("id", current_playlist_item.data('id'));
    audio.attr("src", current_playlist_item.data('src'));
    $("#scrubber").removeAttr("disabled");
    getTimeFromCookie(audio)
    $("#summary").html(summaries[current_playlist_item.data('id')]);

};

playNext = function() {
    playPlaylistItem(current_playlist_item.next(".playlistItem"));
    current_playlist_item.next(".playlistItem")
}
playThis = function(event) {
    playPlaylistItem($(this));
    event.preventDefault();
    return false;
}

switchStation = function() {
    showPlaylist($("#stations").first().val());
}

showPlaylist = function(key) {
    $.getJSON('/json/files?stationid=' + key,
    function(data) {

        HTMLmarkup = ""
        var date = null;
        for (i = 0; i < data.length; i++) {
            current_date = new Date(data[i].date);
            if (date == null ||  (date.getTime() != current_date.getTime())) {
                date = current_date;
                HTMLmarkup += '<dt class="dateSeparator">' + data[i].date + '</dt>';
            }
            HTMLmarkup += '<dd data-src="' + data[i].mp3 + '"id="'+key+'-'+data[i].id+'" data-id="' + data[i].id + '" class="playlistItem" >' + data[i].name + '</dd>';
            summaries[data[i].id]=data[i].summary;
        };
        if (key=="user"){
            $('#userplaylist').empty()
            $('#userplaylist').append(HTMLmarkup);            
        }
        else{
            $('#playlist').empty()
            $('#playlist').append(HTMLmarkup);            
        }
        $('.playlistItem').click(playThis);
        if (loggedin == true && current_playlist_item==null){
            $.get('user/progress',{file:$(audio).data('id')}, function(current_audio_id) {
                playPlaylistItem( $("#"+current_audio_id));
                if (current_playlist_item==null){
                    playPlaylistItem($(".playlistItem").first());
                }
            });
        }
        else{
            playPlaylistItem( $("#"+readCookie("current_audio_id")));
            if (current_playlist_item==null){
                playPlaylistItem($(".playlistItem").first());
            }
            
        }
        if (current_playlist_item==null){
            playPlaylistItem( $("#"+readCookie("current_audio_id")));
        }
        if (current_playlist_item==null){
            playPlaylistItem($(".playlistItem").first());
        }
    });
}

userInfo = function() {
    $.getJSON('/json/userinfo',

    function(data) {
        if (data["login"] == "true"){
            loggedin = true;
            if (loggedin == true && current_playlist_item != null){
                $.post('user/progress',{file:current_playlist_item.attr('id')});
            }
            $("#login").hide();
            $("#logout").show();
            $("#signup-sign").hide();
            $("#userinfo").show();
            $("#username").html(data["user"]);
            showPlaylist("user");
            $.getJSON('/user/feeds',

            function(data) {
                $('#userfeeds').empty()
                $.each(data,
                function(key, val) {
                    $('#userfeeds').append("<li id='feed-"+key+"'>" + val + "</li>");
                });

                $.getJSON('/json/feeds',
                function(data) {
                    $('#feeds').empty();
                    $('#feeds').append("<option>or select one from this list</option>");
                    $.each(data,
                    function(key, val) {
                        if ($("#feed-"+key).length<1){
                            $('#feeds').append("<option value='" + key + "'>" + val + "</option>");
                        }
                    });
                    if($('#feeds').children().length<2){
                        $('#feeds').hide();
                    }
                    else{
                        $('#feeds').show();
                    }
                });

            });

        }
        else{
            loggedin = false;
            //$("#login").show();
            $("#logout").hide();
            $("#signup-sign").show();
            $("#userinfo").hide();
            $("#username").empty();
            $("#userplaylist").empty();
        }
    });
}


login = function() {
    window.location.href = $("#login_url").val();
}

logout = function() {
    $.get("/logout",function() {
        userInfo()
      });


}
    
subscribe = function(){
    
    
    $.post('user/feeds',$("#feedform").serialize(), function(data) {
        $('#feedresult').html(data);
    });
    
}

$(document).ready(
function() {
    $("#play").click(play);
    $("#pause").click(pause);
    $("#login").click(login);
    $("#logout").click(logout);
    $("#subscribe").click(subscribe);
    userInfo();
    $.getJSON('/json/stations',
    function(data) {
        $.each(data,
        function(key, val) {
            $('#stations').append("<option class='station' value='" + key + "'>" + val + "</option>");
        });
        $("#stations").click(switchStation);
        switchStation();

    });
    audio = $("#main_audio");
    audio.bind('end', playNext, false);
    audio.bind('timeupdate', updateTime, false);
    
    $( '#scrubber' ).change(function(){
       audio = $("#main_audio");
       audio.attr("currentTime",$("#scrubber").attr("value"));
    });

    $( '#scrubber' ).mouseup(function(){
       sliding = false;
       if (!paused_before_sliding){
           play();
       }


    });


    $( '#scrubber' ).mousedown(function(){
       sliding = true;
       if (!audio.paused){
           paused_before_sliding = false;
           pause();
       }
       else{
           paused_before_sliding = true;
       }
       
       
    });

});
