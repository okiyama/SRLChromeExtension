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
  req.open('GET', apiUrl + '/test/team', true);
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
  $('a').click(openLink);
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
      
      var name = document.createElement('span');
      name.setAttribute('class', 'name');
      name.innerHTML = channel.display_name;

      var image = document.createElement('img');
      image.setAttribute('src', channel.image.size70);
      image.setAttribute('class', 'ava');

      var title = document.createElement('span');
      title.setAttribute('class', 'description');
      title.innerHTML = addLinksToText('<p>' + channel.title + '</p>');

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
  
  var donate = document.createElement('a');
  donate.setAttribute('id', 'donation_server');
  donate.setAttribute('href', 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VGW56QDZNVHTA');
  donate.setAttribute('title', 'Donations for SRL. Does not go to extension author.');

  fullscreen.appendChild(fsButton);
  container.appendChild(fullscreen);
  container.appendChild(donate);

  main.appendChild(container);
  wrap.appendChild(main);
  document.body.appendChild(wrap);

  renderDonate();
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
    _gaq.push(['_trackEvent', 'Fullscreen Button', 'Activated']);
  }
  else
  {
	  chrome.storage.sync.set({'fullscreen': false});
    _gaq.push(['_trackEvent', 'Fullscreen Button', 'Deactivate']);
  }
}

/**
 * Renders the donation info onto the element which was already appended.
 *
 * @private
 */
function renderDonate()
{
  $.ajax(
  {
    dataType: 'json',
    async: false,
    type : "GET",
    url : apiUrl + '/test',
    success : function(data) { addDonationInfo(data); }
    });
}

/**
 * Given donation data, adds it to the donation element. Helper for renderDonate.
 * @param data The donation data, as an array
 * @return The donate element
 *
 * @private
 */
function addDonationInfo(data)
{
  var container = document.getElementById('donation_server');

  var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ]; //Well, that's annoying.
  var time = new Date();
  var topLine = document.createElement('span');
  topLine.innerHTML = 'SRL server costs - donations for ' + monthNames[time.getMonth()] + ' ' + time.getFullYear();

  var donation_holder = document.createElement('div');
  donation_holder.setAttribute('id', 'donation_holder');
  var donation_bar = document.createElement('span');
  donation_bar.setAttribute('id', 'donation_bar');
  donation_bar.setAttribute('style', 'width: ' + data.percent + '%;')

  donation_holder.appendChild(donation_bar);

  var amount = document.createElement('span');
  amount.setAttribute('id', 'amount');
  var balance = document.createElement('span');
  balance.setAttribute('class', 'gold');
  balance.setAttribute('id', 'd-balance');
  balance.innerHTML = '$' + data.balance;
  var target = document.createElement('span');
  target.setAttribute('class', 'gold');
  target.setAttribute('id', 'd-target');
  target.innerHTML = '$' + data.target;

  amount.innerHTML = "raised ";
  amount.appendChild(balance);
  amount.innerHTML += " out of ";
  amount.appendChild(target);

  container.appendChild(topLine);
  container.appendChild(donation_holder);
  container.appendChild(amount);
}

/**
 * Blacklist of games.
 * Check this before displaying a runner
 * @param game The name of the game
 *
 * @private
 */
function badGame (game) {
  if (game == null) return false;
  if (game.search(/Age of Empires/i) > -1) { return true; }
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
  if (game.search(/Idolmaster/i) > -1) { return true; }
  if (game.search(/League of Legends/i) > -1) { return true; }
  if (game.search(/Mario Party/i) > -1) { return true; }
  if (game.search(/Minecraft/i) > -1) { return true; }
  if (game.search(/Osu!/i) > -1) { return true; }
  if (game.search(/Ragnarok Online/i) > -1) { return true; }
  if (game.search(/Rock Band/i) > -1) { return true; }
  if (game.search(/RuneScape/i) > -1) { return true; }
  if (game.search(/Starcraft/i) > -1) { return true; }
  if (game.search(/StepMania/i) > -1) { return true; }
  if (game.search(/Super Smash Bros/i) > -1) { return true; }
  if (game.search(/Team Fortress/i) > -1) { return true; }
  if (game.search(/Terraria/i) > -1) { return true; }
  if (game.search(/Total Annihilation/i) > -1) { return true; }
  // if (game.search(/Touhou/i) > -1) { return true; }
  if (game.search(/Warcraft/i) > -1) { return true; }
  if (game.search(/Worms/i) > -1) { return true; }
return false;
}

/**
 * Takes text and returns the text with a href links added.
 * @param text The text to add links to
 *
 * @public
 */
function addLinksToText(text) {
    var exp = /(https?:\/\/)?(([A-Za-z0-9#]+[.])+[A-Za-z]{2,3}([\/][A-Za-z0-9#=\?\-]+)*([.][A-Za-z]{2,4})?)/ig;
    return text.replace(exp,"<a href='http://$2'>$1$2</a>"); 
}

/**
 * Opens a link to a new tab.
 * Takes into account if we are trying to open a stream or a link within the description of a stream.
 * This is called when <a> elements are clicked.
 * @param e The event that was clicked
 *
 * @private
 */
function openLink(e)
{
    e.stopPropagation();
    if (this.className == "twitchstreamer")
    {
      openTwitchLink(e);
    }
    else
    {
      chrome.tabs.create({ "url": this.href});
    }
}

/**
 * Helper function made specifically to open a twitch streamer.
 * Takes into account the fullscreen button.
 * @param e The event that we get stream information from
 *
 */
 function openTwitchLink(e)
 {
  var fullscreen = '';
  var streamBaseLink = e.currentTarget.attributes[2].nodeValue; //Attributes[2] is streamLink. 
  //This will have to change if the attributes of twitchStreamer change
  if (document.getElementById('fsButton').checked)
  {
    _gaq.push(['_trackEvent', 'Fullscreen Link', 'used']);
    fullscreen = '/popout/';
  }
  else
  {
    _gaq.push(['_trackEvent', 'Normal link', 'used']);
  }
    chrome.tabs.create({ "url": streamBaseLink + fullscreen });
 }

// Google analytics tracking code
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-41948814-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// Loads stream list as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function ()
{
  requestStreamers();
});
