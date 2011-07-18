var current_playlist_item = null;
var current_date = null;
var sliding = false;

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


function playFromCurrentTime(audio) {             
    setTimeout(function(){
        try
          {
             audio.attr("currentTime",t);
             play();
          }
        catch(err)
          {
             playFromCurrentTime(audio);
          }
        },500); 
    }
    
function getTimeFromCookie(audio) {
    audio.attr("preload","auto");
    audio.get(0).load()
    id = audio.data('id');
    t = readCookie("currentTime" + id);
    if (id != null && t != null) {
        playFromCurrentTime(audio);
    }
    else{
        play();
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
    current_playlist_item.addClass("currentPlaylistItem");
    $("#current").html(current_playlist_item.html());
    audio = $("#main_audio")
    audio.data("id", current_playlist_item.attr('id'));
    audio.attr("src", current_playlist_item.data('src'));
    $("#scrubber").removeAttr("disabled");
    getTimeFromCookie(audio)


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
        $('#playlist').empty()
        HTMLmarkup = ""
        var date = null;
        for (i = 0; i < data.length; i++) {
            current_date = new Date(data[i].date);
            if (date == null ||  (date.getTime() != current_date.getTime())) {
                date = current_date;
                HTMLmarkup += '<dt class="dateSeparator">' + data[i].date + '</dt>';
            }
            HTMLmarkup += '<dd data-src="' + data[i].mp3 + '" id="' + data[i].id + '" class="playlistItem" >' + data[i].name + '</dd>';
        };
        $('#playlist').append(HTMLmarkup);
        playlist_item = $('.playlistItem')
        playlist_item.click(playThis);
        playPlaylistItem( $("#"+readCookie("current_audio_id")));
        if (current_playlist_item==null){
            playPlaylistItem($(".playlistItem").first());
        }
    });
};



$(document).ready(
function() {

    $("#play").click(play);
    $("#pause").click(pause);

    
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
    $("#scrubber").select(function() {
      alert("Handler for .keypress() called.");
    });
    
    $( '#scrubber' ).click(function(){
        audio = $("#main_audio");
       audio.attr("currentTime",$("#scrubber").attr("value"));
       sliding = false;       
    });

    $( '#scrubber' ).change(function(){
       sliding = true;
    });

});
