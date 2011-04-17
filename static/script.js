var playlists = {"keys":new Array};
var current_playlist_item = null

getAudio = function(playlist_item) {
    if (playlist_item==null){
        return null;
    }
    return playlist_item.find("audio").get(0);
}


pause = function() {
current = getAudio(current_playlist_item);
if (current !=null){
    current.pause();
}
return false;
}

play = function() {
current = getAudio(current_playlist_item);
if (current !=null){
    current.load();
    current.play();
    urrent.addEventListener('end',playNext,false);
    loadNext();
}
return false;
}


loadNext = function() {
    audio=getAudio(current_playlist_item.next());
    if(audio != null){
        audio.load();
    }
    
}


getPercentProg = function() {
  var audio = this;
  var endBuf = audio.buffered.end(0);
  var soFar = parseInt(((endBuf / audio.duration) * 100));
  $(this).parent().find(".loadStatus").html(soFar + '%');
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
    playPlaylistItem(current_playlist_item.next());
}
playThis = function() {
    playPlaylistItem($(this));
}
  

showPlaylist = function(key){
    HTMLmarkup="<dt id='station-"+key+"'>"+playlists[key].title+"</dt><dd id='station-playlist-"+key+"'><ul>"
    data = playlists[key].playlist
    for (i =0;i<data.length;i++){
       HTMLmarkup += '<li class="playlistItem"><span>'+data[i].name+'</span> <span class="loadStatus">0%</span> '+data[i].date+'<audio preload="none" src="'+data[i].mp3+'"></audio></li>';
    };
     HTMLmarkup += "</ul</dd>"
    $('#stations').append(HTMLmarkup);
    playlist_item=$('#station-playlist-'+key).find('.playlistItem')
    playlist_item.click(playThis);
    $.each(playlist_item.find("audio").get(), function(key, value) { 
        value.addEventListener('progress',getPercentProg,false);
    });
    if (current_playlist_item==null){
        playPlaylistItem($(".playlistItem").first());
    }
};



$(document).ready(
function() {
    $("#play").click(play);
    $("#pause").click(pause);
    $.getJSON('/json/stations',function(data) {
        $('#stations').empty()
        $.each(data,function(key, val) {
            $.getJSON('/json/files?stationid='+key,
            function(data) {
                playlists[key]={'title':val,'playlist':data};
                playlists.keys.push(key);
                showPlaylist(key)
            });
        });

    });

});
