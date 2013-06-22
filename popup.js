/**
 * Speed Runs Live Stream Viewer main Javascript file for the popup.
 * Loads the popup and populates it with streams.
 * 
 * Licensing information can be found in LICENSE.txt.
 * If you want to use this or want more information, you can always just email me
 * at julianjocque (at) gmail.com
 */

/**
 * Sends an XHR GET request to grab streamer info from SpeedRunsLive.com. The
 * XHR's 'onload' event is hooked up to the 'loadRunners' method.
 *
 * @public
 */
function requestStreamers()
{
  var req = new XMLHttpRequest();
  req.open('GET', 'http://api.speedrunslive.com:81/test/team', true);
  req.onload = loadRunners.bind(this);
  req.send(null);
}

/**
 * Handle the 'onload' event of our streamer XHR request, generated in
 * 'requestStreamers', by generating 'img' elements, and stuffing them into
 * the document for display.
 *
 * @param {ProgressEvent} e The XHR ProgressEvent.
 * @private
 */
function loadRunners(e)
{
  var runners = e.target.responseText;
  var data = JSON.parse(runners);

  initializeDoc(data);

  var streamerList = loadStreamerList(data);

  var container = document.getElementsByClassName('container');

  container[0].appendChild(streamerList);
}

/**
 * Loads the streamerList from the given JSON data then returns it.
 * @param data The JSON data to load the streamer list from.
 * @return The streamerList as a div to append to the document.
 *
 * @private
 */
function loadStreamerList(data)
{
  var streamerList = document.createElement('div');
  streamerList.setAttribute('id', 'streamList');

  for (var i = 0; i < data.channels.length; i++)
  {
    var channel = data.channels[i].channel;
    if (!badGame(channel.meta_game, channel.name))
    {
      var streamer = document.createElement('a');
      streamer.setAttribute('class', 'twitchstreamer');
      streamer.setAttribute('href', '#');
      streamer.setAttribute('streamLink', 'http://www.twitch.tv/' + String(channel.name));

      //This is weird because it requires closure
      //This opens up the link. It's messy to put it right here, but messier to pull it out.
      streamer.onclick = function()
      {
        var currentStreamer = streamer;
        return function()
        {
		  var fullscreen = '';
		  if (document.getElementById('fsButton').checked)
		  {
			  fullscreen = '/popout/';
		  }
          chrome.extension.getBackgroundPage().openUrl(currentStreamer.getAttribute('streamLink') + fullscreen);
        }
      }();
      
      var name = document.createElement('span');
      name.setAttribute('class', 'name');
      name.innerHTML = channel.display_name;

      var image = document.createElement('img');
      image.setAttribute('src', channel.image.size70);
      image.setAttribute('class', 'ava');

      var title = document.createElement('span');
      title.setAttribute('class', 'description');
      title.innerHTML = '<p>' + channel.title + '</p>';

      var viewers = document.createElement('span');
      viewers.setAttribute('class', 'viewers');
      viewers.innerHTML = channel.current_viewers + ' viewers' + '<br />';

      var streamerInfo = document.createElement('div');
      streamerInfo.setAttribute('class', 'streamerinfo');
      streamerInfo.appendChild(name);
      streamerInfo.appendChild(viewers);
      streamerInfo.appendChild(title);

      streamer.appendChild(image);
      streamer.appendChild(streamerInfo);
      streamerList.appendChild(streamer);
    }
  };

  return streamerList;
}

/**
 * Initializes the document by loading the top level divs.
 * @param data The JSON data to load runner count from
 *
 * @private
 */
function initializeDoc(data)
{
  var wrap = document.createElement('div');
  wrap.setAttribute('id', 'wrap');

  var main = document.createElement('div');
  main.setAttribute('id', 'main');

  var container = document.createElement('div');
  container.setAttribute('class', 'container');

  var fullscreen = document.createElement('label');
  fullscreen.setAttribute('id', 'fullscreen');
  fullscreen.innerHTML = 'Fullscreen';
  fullscreen.onclick = function() { storeFS(); }
  
  var fsButton = document.createElement('input')
  fsButton.setAttribute('id', 'fsButton');
  fsButton.setAttribute('type', 'checkbox');
  
  
  chrome.storage.sync.get('fullscreen', function(data) 
  {
	fsButton.checked = data['fullscreen'];
  });
  
  fullscreen.appendChild(fsButton);
  container.appendChild(fullscreen);

  main.appendChild(container);
  wrap.appendChild(main);
  document.body.appendChild(wrap);
}

/**
 * Stores if the Fullscreen Button is checked or not to sync storage. 
 * 
 * @private
 */
function storeFS()
{
  var fullscreen;
  if (document.getElementById('fsButton').checked)
  {
	  chrome.storage.sync.set({'fullscreen': true});
  }
  else
  {
	  chrome.storage.sync.set({'fullscreen': false});
  }
}

/**
 * Blacklist of games.
 * Check this before displaying a runner
 * @param game The name of the game
 * @param name The name of the runner
 *
 * @private
 */
function badGame(game, name)
{
  if (game == null) return true;
  if (game.search(/Audiosurf/i) > -1) { return true; }
  if (game.search(/beatmania/i) > -1) { return true; }
  if (game.search(/Dance Dance Revolution/i) > -1) { return true; }
  if (game.search(/DayZ/i) > -1) { return true; }
  if (game.search(/Diablo/i) > -1) { return true; }
  if (game.search(/Dota 2/i) > -1) { return true; }
  if (game.search(/Guild Wars/i) > -1) { return true; }
  if (game.search(/Guitar Hero/i) > -1) { return true; }
  if (game.search(/Heroes of Newerth/i) > -1) { return true; }
  if (game.search(/iDOLM@STER/i) > -1) { return true; }
  if (game.search(/M@STER/i) > -1) { return true; }
  if (game.search(/Idolmaster/i) > -1) { return true; }
  if (game.search(/League of Legends/i) > -1) { return true; }
  if (game.search(/Mario Party/i) > -1) { return true; }
  if (game.search(/Minecraft/i) > -1) { return true; }
  if (game.search(/Osu!/i) > -1) { return true; }
  if (game.search(/Rock Band/i) > -1) { return true; }
  if (game.search(/RuneScape/i) > -1) { return true; }
  if (game.search(/Starcraft/i) > -1 && name != "Raelcun") { return true; }
  if (game.search(/StepMania/i) > -1) { return true; }
  if (game.search(/Super Smash Bros/i) > -1) { return true; }
  if (game.search(/Team Fortress/i) > -1) { return true; }
  if (game.search(/Terraria/i) > -1) { return true; }
  if (game.search(/Total Annihilation/i) > -1) { return true; }
  if (game.search(/Warcraft/i) > -1) { return true; }
  if (game.search(/Worms/i) > -1) { return true; }
  if (game.search(/Nail/i) > -1) { return true; } //hehe <-That's Cosmo's comment, not mine

  return false;
}

// Runs the streamer loading as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function ()
{
  requestStreamers();
});
