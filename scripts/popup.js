/**
 * Speed Runs Live Stream Viewer main popup. Holds logic for loading all of the pages.
 * 
 *
 * Copyright (C) 2012-2013 Julian Jocque
 * 
 * This file is part of SpeedRunsLive Stream Viewer.
 * 
 * SpeedRunsLive Stream Viewer is free software: you can redistribute it and/or modify
 * it under the terms of version 2 of the GNU General Public License as published by
 * the Free Software Foundation.
 * 
 * SpeedRunsLive Stream Viewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SpeedRunsLive Stream Viewer.  If not, see <http://www.gnu.org/licenses/>.
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
  var streamerList = document.getElementById('streamList');

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
  fsButton.onclick = function() { storeFS(); };
  chrome.storage.sync.get('fullscreen', function(data) 
  {
	  document.getElementById('fsButton').checked = data['fullscreen'];
  });
  
  var currentPageButton = streamsButton;
  settingsButton.onclick = function() { currentPageButton = swapPage(settingsButton, currentPageButton); };
  streamsButton.onclick = function() { currentPageButton = swapPage(streamsButton, currentPageButton);  };
  aboutLink.onclick = function() { currentPageButton = swapPage(aboutLink, currentPageButton); };
  
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
 * Switches from the current page to the page targeted by nextPageButton.
 * Returns the page ID of the current page after swapping
 *
 * @private
 */
function swapPage(nextPageButton, currentPageButton)
{
  var newPageID = nextPageButton.attributes['target'].nodeValue;
  var currentPageID = currentPageButton.attributes['target'].nodeValue;
  if(nextPageButton != currentPageButton) {
    $(currentPageButton).attr('isSelected', 'false');
    $(nextPageButton).attr('isSelected', 'true');
    $(currentPageID).hide();
    $(newPageID).fadeIn(300);
  }
  return nextPageButton;
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
  var topLine = document.getElementById('donationTopLine');
  topLine.innerHTML = 'SRL server costs - donations for ' + monthNames[time.getMonth()] + ' ' + time.getFullYear();

  var donation_bar = document.getElementById('donation_bar');
  donation_bar.setAttribute('style', 'width: ' + data.percent + '%;')

  donation_holder.appendChild(donation_bar);

  var amount = document.createElement('span');
  amount.setAttribute('id', 'amount');
  var balance = document.getElementById('d-balance');
  balance.innerHTML = '$' + data.balance;
  var target = document.getElementById('d-target');
  target.innerHTML = '$' + data.target;
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
  if (game.search(/beatmania/i) > -1) { return true; }
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
  var streamBaseLink = e.currentTarget.attributes['streamLink'].nodeValue;
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
_gaq.push(['_setAccount', analyticsID]);
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
