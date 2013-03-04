/**
 * Sends an XHR GET request to grab streamer info from SpeedRunsLive.com. The
 * XHR's 'onload' event is hooks up to the 'loadRunners' method.
 *
 * @public
 */
function requestStreamers() 
{
  var req = new XMLHttpRequest();
  req.open('GET', 'http://www.speedrunslive.com:81/test/team', true);
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

  var wrap = document.createElement('div');
  wrap.setAttribute('id', 'wrap');

  var main = document.createElement('div');
  main.setAttribute('id', 'main');

  var container = document.createElement('div');
  container.setAttribute('class', 'container');

  var runnerCount = document.createElement('div');
  runnerCount.setAttribute('id', 'runnerCount');
  runnerCount.innerHTML = '<h2>' + String(data.channels.length + ' runners currently streaming</h2>');
  document.body.appendChild(runnerCount);

  var streamerList = loadStreamerList(data);

  container.appendChild(streamerList);
  main.appendChild(container);
  wrap.appendChild(main);
  document.body.appendChild(wrap);
}

/**
 * Loads the streamerList from the given JSON data then returns it.
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
      var text = document.createElement('div');
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
      name.innerHTML = channel.display_name;


      title.setAttribute('class', 'description');
      title.innerHTML = '<p>' + channel.title + '</p>';

      streamerInfo.appendChild(name);
      streamerInfo.innerHTML += channel.current_viewers + ' viewers' + '<br />';
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
 * Loads the data and then returns it.
 * Would be better to have this in two functions, but there is a lot of passing to do then.
 */
function initializeDocAndLoadData(e)
{
  var data = JSON.parse(runners);
  var wrap = document.createElement('div');
  wrap.setAttribute('id', 'wrap');
  var main = document.createElement('div');
  main.setAttribute('id', 'main');
  var container = document.createElement('div');
  container.setAttribute('class', 'container');

  var runners = e.target.responseText;
  var runnerCount = document.createElement('div');

  runnerCount.setAttribute('id', 'runnerCount');
  runnerCount.innerHTML = '<h2>' + String(data.channels.length + ' runners currently streaming</h2>');
  document.body.appendChild(runnerCount);

  return data;
}

/**
 * Blacklist of games.
 * Check this before displaying a runner
 */
function badGame(game, name) 
{
  // this is the SRL blacklist
  if (game == null) return true;
  if (game.search(/Audiosurf/i) > -1) { return true; }
  //if (game.search(/Borderlands/i) > -1) { return true; }
  if (game.search(/beatmania/i) > -1) { return true; }
  //if (game.search(/Call of Duty/i) > -1) { return true; }
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
  // if (game.search(/Touhou/i) > -1) { return true; }
  if (game.search(/Warcraft/i) > -1) { return true; }
  if (game.search(/Worms/i) > -1) { return true; }
  if (game.search(/Nail/i) > -1) { return true; } //hehe
return false;
}

// Runs the streamer loading as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () 
{
  requestStreamers();
});
