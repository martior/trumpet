var current_playlist_item = null;
var current_date=null;

getAudio = function(playlist_item) {
    if (playlist_item==null){
        return null;
    }
    return playlist_item.find("audio").get(0);
}


pause = function() {
current = getAudio(current_playlist_item);
$("#playpause").val('Play');
if (current !=null){
    current.pause();
}
return false;
}

play = function() {
updateTime();
current = getAudio(current_playlist_item);
$("#playpause").val('Pause');
if (current !=null){
    current.play();
}
return false;
}


playOrPause = function() {
    current = getAudio(current_playlist_item);
    $("#playpause").val( current.paused ?  'Pause':'Play');
    if (current.paused) {
        current.play();
    } else {
        current.pause();
  }
  return false;
}


prettyPrintNumber = function (number) {
  return ((number < 10) ? '0' : '') + number;
};
prettyPrintTime = function (time) {
  var components = [];
  components[0] = prettyPrintNumber(Math.floor(time / 3600));
  components[1] = prettyPrintNumber(Math.floor((time % 3600) / 60));
  components[2] = prettyPrintNumber(Math.floor(time % 60));
  return components.join(':');
};

updateTime = function(){
    current = getAudio(current_playlist_item);
    $("#time").html(prettyPrintTime(current.currentTime)+" of "+prettyPrintTime(current.duration));
}


getPercentProg = function() {
  var audio = this;
  var endBuf = audio.buffered.end(0);
  var soFar = parseInt(((endBuf / audio.duration) * 100));
  $(this).siblings(".loadStatus").html(soFar + '%');
  }

playPlaylistItem = function(playlist_item) {
    if (playlist_item.get(0)==null){
        return;
    }
    if (current_playlist_item!=null){
        pause();
        current_playlist_item.css("background-color","white");
    }
    current_playlist_item=playlist_item;
    current_playlist_item.css("background-color","red");
    play();
    $("#current").html(current_playlist_item.children("span").html());
};

playNext = function() {
    playPlaylistItem(current_playlist_item.next(".playlistItem"));
}
playThis = function() {
    playPlaylistItem($(this));
}

switchStation = function(){
    showPlaylist($("#stations").first().val());
}

showPlaylist = function(key){
    $.getJSON('/json/files?stationid='+key,
    function(data) {
        $('#playlist').empty()
        HTMLmarkup=""
        var date=null;
        for (i =0;i<data.length;i++){
            current_date = new Date(data[i].date);
            if (date==null){
                date=current_date;
                HTMLmarkup += '<div style="display:none;" class="dateSeparator"><span>'+data[i].date+'</span>';                                
            }
            else if (date.getTime() != current_date.getTime()){
                date=current_date;
                HTMLmarkup += '</div><div style="display:none;" class="dateSeparator"><span>'+data[i].date+'</span>';                
            }
            HTMLmarkup += '<div class="playlistItem"><span>'+data[i].name+'</span> <span class="loadStatus">0%</span><audio preload="none" src="'+data[i].mp3+'"></audio></div>';
        };
         HTMLmarkup += "</div>"
        $('#playlist').append(HTMLmarkup);
        current_date = $(".dateSeparator").first();
        current_date.css("display","block");
        playlist_item=$('.playlistItem')
        playlist_item.click(playThis);
        playlist_item.find("audio").bind('progress',getPercentProg,false);
        playlist_item.find("audio").bind('end',playNext,false);
        playlist_item.find("audio").bind('timeupdate',updateTime,false);
        if (current_playlist_item==null){
            playPlaylistItem($(".playlistItem").first());
        }
    });
};



changeDay = function(newDay) {
    if (newDay.length>0){
        current_date = newDay;
        $(".dateSeparator").css("display","none");
        current_date.css("display","block");
    }
    
}

previousDay = function() {
    changeDay(current_date.next());
    };

nextDay = function() {
    changeDay(current_date.prev());
    };


$(document).ready(
function() {
    $("#play").click(play);
    $("#pause").click(pause);
    $.getJSON('/json/stations',function(data) {
        $.each(data,function(key, val) {
                    $('#stations').append("<option class='station' value='"+key+"'>"+val+"</option>");
        });
    $("#stations").click(switchStation);
    switchStation();

    });

});
