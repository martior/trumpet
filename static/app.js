var current_playlist_item = null;
var current_date = null;
var sliding = false;
var paused_before_sliding = true;
var update_server=true;
var summaries = {};


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
    audio_tag.attr("preload","auto");
    audio_tag.get(0).load()
    id = audio_tag.data('id');
    if (id == null){
        play()
        
    }
    else{
        t = readCookie("currentTime" + id);
        if (t != null) {
            playFromCurrentTime(audio_tag,t);
        }
        else{
            play()
        }
        
    }
        
    

}

pause = function() {
    audio_tag = getAudio();
    $("#playpause").val('Play');
    if (audio_tag != null) {
        audio_tag.pause();
    }
    return false;
}

play = function() {
    audio_tag = getAudio();
    $("#playpause").val('Pause');
    if (audio_tag != null) {
        audio_tag.play();
    }
    return false;
}


playOrPause = function() {
    audio_tag = getAudio();
    $("#playpause").val(audio_tag.paused ? 'Pause': 'Play');
    if (audio_tag.paused) {
        audio_tag.play();
    } else {
        audio_tag.pause();
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
    audio_tag = getAudio();
    $("#time").html(prettyPrintTime(audio_tag.currentTime) + " of " + prettyPrintTime(audio_tag.duration));
    createCookie("currentTime" + $(audio_tag).data('id'), Math.floor(audio_tag.currentTime));
    if (sliding == false) {
        $("#scrubber").attr("max", Math.floor(audio_tag.duration));
        $("#scrubber").attr("value", Math.floor(audio_tag.currentTime));
    }
}


getPercentProg = function() {
    audio_tag = this;
    endBuf = audio_tag.buffered.end(0);
    soFar = parseInt(((endBuf / audio_tag.duration) * 100));
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
    current_playlist_item.addClass("currentPlaylistItem");
    $("#current").html(current_playlist_item.html());
    audio_tag = $("#main_audio")
    audio_tag.data("id", current_playlist_item.data('id'));
    audio_tag.attr("src", current_playlist_item.data('src'));
    $("#scrubber").removeAttr("disabled");
    getTimeFromCookie(audio_tag)
    $("#summary").html(summaries[current_playlist_item.data('id')]);
    
    $("#summary").find("img").load(function()  {
        if (this.width> 320){
            factor = 320/this.width;
            this.width = this.width*factor;
            this.height = this.height*factor;
          }  
        });

    

};

playNext = function() {
    if (!$("#sleep-mode").attr('checked')){
        playPlaylistItem(current_playlist_item.next(".playlistItem"));
        current_playlist_item.next(".playlistItem")        
    }
}
playThis = function(event) {
    playPlaylistItem($(this));
    event.preventDefault();
    return false;
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
        $('#playlist').empty()
        $('#playlist').append(HTMLmarkup);            
        $('.playlistItem').click(playThis);
        if (current_playlist_item==null){
            playPlaylistItem( $("#"+readCookie("current_audio_id")));
            pause();
        }
        if (current_playlist_item==null){
            playPlaylistItem($(".playlistItem").first());
            pasue();
        }
    });
}


$(document).ready(
function() {
    $("#play").click(play);
    $("#pause").click(pause);
    audio_tag = $("#main_audio");
    audio_tag.bind('end', playNext, false);
    audio_tag.bind('timeupdate', updateTime, false);
    $( '#scrubber' ).change(function(){
       audio_tag = $("#main_audio");
       audio_tag.attr("currentTime",$("#scrubber").attr("value"));
    });
    $( '#scrubber' ).mouseup(function(){
       sliding = false;
       if (!paused_before_sliding){
           play();
       }


    });
    $( '#scrubber' ).mousedown(function(){
       sliding = true;
       if (!audio_tag.paused){
           paused_before_sliding = false;
           pause();
       }
       else{
           paused_before_sliding = true;
       }
       
       
    });
    showPlaylist();

});
