var current_playlist_item = null

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
        var date=new Date();
        for (i =0;i<data.length;i++){
            current_date = new Date(data[i].date);
            if (date.getTime() != current_date.getTime()){
                date=current_date;
                HTMLmarkup += '<div class="dateSeparator">'+date+'</div>';                
            }
            HTMLmarkup += '<div class="playlistItem"><span>'+data[i].name+'</span> <span class="loadStatus">0%</span> '+data[i].date+'<audio preload="auto" src="'+data[i].mp3+'"></audio></div>';
        };
         HTMLmarkup += ""
        $('#playlist').append(HTMLmarkup);
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
