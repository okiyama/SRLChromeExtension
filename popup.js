var SRLStreamViewer = 
{

  /**
   * Sends an XHR GET request to grab streamer info from SpeedRunsLive.com. The
   * XHR's 'onload' event is hooks up to the 'loadRunners' method.
   *
   * @public
   */
  requestStreamers: function() 
  {
    var req = new XMLHttpRequest();
    req.open('GET', 'http://www.speedrunslive.com:81/test/team', true);
    req.onload = this.loadRunners.bind(this);
    req.send(null);
  },

  /**
   * Handle the 'onload' event of our streamer XHR request, generated in
   * 'requestStreamers', by generating 'img' elements, and stuffing them into
   * the document for display.
   *
   * @param {ProgressEvent} e The XHR ProgressEvent.
   * @private
   */
  loadRunners: function (e) 
  {
    var wrap = document.createElement('div');
    wrap.setAttribute('id', 'wrap');
    var main = document.createElement('div');
    main.setAttribute('id', 'main');
    var container = document.createElement('div');
    container.setAttribute('class', 'container');

    var runners = e.target.responseText;
    var runnerCount = document.createElement('div');
    var streamerList = document.createElement('div');

    var data = JSON.parse(runners);
    runnerCount.setAttribute('id', 'runnerCount');
    runnerCount.innerHTML = '<h2>' + String(data.channels.length + ' runners currently streaming</h2>');
    document.body.appendChild(runnerCount);

    streamerList.setAttribute('id', 'streamList');
    for (var i = 0; i < data.channels.length; i++) 
    {
      var streamer = document.createElement('a');
      var text = document.createElement('div');
      var channel = data.channels[i].channel;
      var name = document.createElement('span');
      var image = document.createElement('img');
      var title = document.createElement('span');

      streamer.setAttribute('class', 'twitchstreamer');
      streamer.setAttribute('href', 'http://www.twitch.tv/' + String(channel.name)); //+ '/popout');
      streamer.setAttribute('target', '_blank');

      image.setAttribute('src', channel.image.size70);
      image.setAttribute('class', 'ava');

      var streamerInfo = document.createElement('div');
      streamerInfo.setAttribute('class', 'streamerinfo');

      name.setAttribute('class', 'name');
      name.innerHTML = data.channels[i].channel.display_name;


      title.setAttribute('class', 'description');
      title.innerHTML = '<p>' + channel.title + '</p>';

      streamerInfo.appendChild(name);
      streamerInfo.innerHTML += channel.current_viewers + ' viewers' + '<br />';
      streamerInfo.appendChild(title);

      streamer.appendChild(image);
      streamer.appendChild(streamerInfo);
      streamerList.appendChild(streamer);
    };
    container.appendChild(streamerList);
    main.appendChild(container);
    wrap.appendChild(main);
    document.body.appendChild(wrap);
    
  },
};

// Runs the streamer loading as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () 
{
  SRLStreamViewer.requestStreamers();
});
