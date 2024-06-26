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
const apiUrl = 'http://api.speedrunslive.com';

function requestStreamers()
{
  var req = new XMLHttpRequest();
  req.open('GET', apiUrl + '/frontend/streams', false);
  req.onload = loadRunners.bind(this);
  try {
    req.send(null);
  }
  catch (error) {
    console.dir(error);
    if (error.code === 19) {
      const confirmNavigation = confirm(
          'To continue using the extension, you need to navigate to the SpeedRunsLive API and accept the risk of using an insecure connection. ' +
          'Do you want to proceed to http://api.speedrunslive.com/?\n\n' +
          'You will choose the "Advanced" button then the small "Proceed to api.speedrunslive.com (unsafe)" link at the bottom of the warning page.'
      );

      if (confirmNavigation) {
        chrome.tabs.create({url: 'http://api.speedrunslive.com/'});
      }
    }
    var errorMessage = document.createElement('div');
    errorMessage.setAttribute('class', 'errorMessage');
    errorMessage.innerHTML = "Error loading data from SpeedRunsLive. <br />" +
        "Most likely, SpeedRunsLive.com is down. <br />" +
        "If SpeedRunsLive.com is up, please email me at JulianJocque+SRL@gmail.com <br /> <br />" +
        "Thank you for you patience while things get sorted!";
    document.getElementById('streamList').appendChild(errorMessage);
  }
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

  //For now, just only do Twitch. We'll add Hitbox in a little bit.
  var filteredChannels = data._source.channels.filter(
    function (el) {
      return el.api == "twitch";
    });

  //Sort by viewers
  var sortedChannels = 
    filteredChannels.sort(
      function (a, b) {
        if (a.current_viewers > b.current_viewers) {
          return -1;
        }
        else {
          return 1;
        }
      });

  for (var i = 0; i < sortedChannels.length; i++)
  {
    var channel = sortedChannels[i];
    var streamer = document.createElement('a');
    streamer.setAttribute('class', 'twitchstreamer');
    streamer.setAttribute('href', '#');
    streamer.setAttribute('streamLink', 'http://www.twitch.tv/' + String(channel.name));
    streamer.setAttribute('streamName', String(channel.name));
    
    var name = document.createElement('span');
    name.setAttribute('class', 'name');
    name.innerHTML = channel.user_name;

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
  loadButtons();
  renderDonate();
  loadStreamerList(data);
}

/**
 * Loads the buttons for the extension. Sets them appropriately based on previously saved settings.
 *
 * @private
 */
function loadButtons()
{
  setButtonsOnClicks();
  loadOpenLinks();
}

/**
 * Sets the onclick behavior for all the buttons in the extension.
 *
 * @private
 */
function setButtonsOnClicks()
{
  setOpenLinkOnClicks();
  setPageOnClicks();
}

/**
 * Sets the onclick behavior for the buttons which determine how to oepn links in the settings.
 *
 * @private
 */
function setOpenLinkOnClicks()
{
  twitchButton.onclick = function() { storeOpenLink(twitchButton); };
  twitchFSButton.onclick = function() { storeOpenLink(twitchFSButton); };
  srlButton.onclick = function() { storeOpenLink(srlButton); };
}

/**
 * Sets the onclick behavior for the buttons which switch between the pages.
 *
 * @private
 */
function setPageOnClicks()
{
  var currentPageButton = streamsButton;
  settingsButton.onclick = function() { currentPageButton = swapPage(settingsButton, currentPageButton); };
  streamsButton.onclick = function() { currentPageButton = swapPage(streamsButton, currentPageButton);  };
  aboutLink.onclick = function() { currentPageButton = swapPage(aboutLink, currentPageButton); };
}

/**
 * Stores that the given button should be used to open links.
 * 
 * @private
 */
function storeOpenLink(button)
{
  var buttonID = button.id; //For some reason, can't use periods inside the sync set function
  if (button.checked)
  {
	  chrome.storage.sync.set({'openLinksWith': button.id});
    _gaq.push(['_trackEvent', buttonID, 'Activated']);
  }
  else
  {
	  chrome.storage.sync.set({'openLinksWith': button.id});
    _gaq.push(['_trackEvent', buttonID, 'Deactivated']);
  }
}

/**
 * Loads how to open links from storage.
 *
 * @private
 */
function loadOpenLinks()
{
  chrome.storage.sync.get('openLinksWith', function(data) 
  {
    document.getElementById(data['openLinksWith']).checked = true;
  });
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

  var currentMonthYear = getCurrentMonthYear();
  var topLine = document.getElementById('donationTopLine');
  topLine.innerHTML = 'SRL server costs - donations for ' + currentMonthYear;

  var donation_bar = document.getElementById('donation_bar');
  donation_bar.setAttribute('style', 'width: ' + data.percent + '%;')

  var amount = document.createElement('span');
  amount.setAttribute('id', 'amount');
  var balance = document.getElementById('d-balance');
  balance.innerHTML = '$' + data.balance;
  var target = document.getElementById('d-target');
  target.innerHTML = '$' + data.target;
}

/**
 * Gets the current month in Month Year format.
 * Ex: December 2013
 *
 * @private
 */
function getCurrentMonthYear()
{
  var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
  var time = new Date();

  return monthNames[time.getMonth()] + ' ' + time.getFullYear()
}

/**
 * Takes text and returns the text with a href links added.
 * @param text The text to add links to
 *
 * @public
 */
function addLinksToText(text) {
    var exp = /(https?:\/\/)?(([A-Za-z0-9#-]+[.])+[A-Za-z]{2,3}([\/][A-Za-z0-9#=\?\-]+)*([.][A-Za-z]{2,4})?)(\/?)/ig;
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
  var howToOpen = document.querySelector('.settingsButton:checked').attributes['id'].nodeValue;
  var streamName = e.currentTarget.attributes['streamName'].nodeValue;

  if (howToOpen == 'twitchFSButton') {
    _gaq.push(['_trackEvent', 'Twitch fullscreen Link', 'used']);
    chrome.tabs.create({ "url": 'http://www.twitch.tv/' + streamName + "/popout/" });
  }
  else if (howToOpen == 'srlButton') {
    _gaq.push(['_trackEvent', 'SRL Link', 'used']);
    chrome.tabs.create({ "url": 'http://speedrunslive.com/#!/' + streamName });
  }
  else {
    //We will default to Twitch for safety
    _gaq.push(['_trackEvent', 'Twitch link', 'used']);
    chrome.tabs.create({ "url": 'http://www.twitch.tv/' + streamName });
  }
    
 }

// Loads stream list as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function ()
{
  requestStreamers();
});
