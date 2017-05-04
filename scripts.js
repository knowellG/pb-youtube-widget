(function loadIframePlayer() {
  // 2. This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})()

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var Player;
function onYouTubeIframeAPIReady() {
  Player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'D_XGtUbCo9M',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    // setTimeout(stopVideo, 6000);
    done = true;
  }
}

function stopVideo() {
  Player.stopVideo();
}

/// make a playlist container ///
(function appendUlToDiv () {
  var playlistContainer = document.getElementById('playlist-container');
  var ul = document.createElement('ul');
  ul.id = 'playlistItems';
  playlistContainer.appendChild(ul);
})()

/// build url for requests ///
function buildUrl(url, parameters){
  var qs = "";
  for(var key in parameters) {
    if (parameters[key] === null || parameters[key] === undefined) {
      delete parameters[key];
    } else {
      var value = parameters[key];
      qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length-1); //chop off last "&"
    url = url + "?" + qs;
  }
  return url;
}

/// load video to Player ///
function loadVideo(id) {
  Player.loadVideoById(id, 0, "large")
}

/// getPlaylistItems ///
var playlist, nextPageToken, prevPageToken

function getPlaylistItems(pageToken) {
  // PotteryBarn channel uploads playlist
  var params = {
    part: 'snippet,contentDetails,status',
    playlistId: 'UUg6NgXXsv_qKm3R1fCWY45w',
    maxResults: 5,
    key: 'AIzaSyDLxjzoV7HjLpIVrm3tUoSmbvQigeL3QAY',
    pageToken: pageToken || null
  }

  var url = 'https://www.googleapis.com/youtube/v3/playlistItems'
  var playlistItemsRequest = new XMLHttpRequest();

  playlistItemsRequest.open('GET', buildUrl(url, params), true);
  playlistItemsRequest.send();

  playlistItemsRequest.onload = function() {
    if (playlistItemsRequest.readyState === 4) {
      if (playlistItemsRequest.status === 200) {
        playlist = JSON.parse(playlistItemsRequest.response);
        nextPageToken = playlist.nextPageToken;
        showItems(playlist.items);
      } else {
        console.error(playlistItemsRequest.statusText);
      }
    }
  };
}

function showItems(items) {
  for (var i = 0; i < items.length; i++) {
    createPlaylistItem(items[i]);
  }
}

function createPlaylistItem(item){
  var listItem = document.createElement('li');
  listItem.className = 'playlist-listitem';
  listItem.id = item.snippet.resourceId.videoId;
  listItem.addEventListener('click', function(){loadVideo(listItem.id)})

  // add div
  var div = document.createElement('div');

  // add image
  var image = document.createElement('img');
  image.src = item.snippet.thumbnails.default.url;
  image.className = 'thumbnail';

  // add infoDiv
  var info = document.createElement('div');
  info.className = 'info';

  //add title
  var title = document.createElement('div');
  title.innerHTML = item.snippet.title;
  title.className = 'title';

  //add channel
  var channel = document.createElement('div');
  channel.innerHTML = item.snippet.channelTitle;
  channel.className = 'channel';

  info.appendChild(title);
  info.appendChild(channel);

  div.appendChild(image);
  div.appendChild(info);

  listItem.appendChild(div);

  appendItemToContainer(listItem);
}

function appendItemToContainer (listItem) {
  var container = document.getElementById('playlistItems');
  container.appendChild(listItem)
}

/// scrolling ///
function scrolled(o) {
  //visible height + pixel scrolled = total height
  if (o.offsetHeight + o.scrollTop == o.scrollHeight) {
      getPlaylistItems(nextPageToken);
  }
}

getPlaylistItems();
