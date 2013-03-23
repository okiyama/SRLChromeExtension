/**
 * Background javascript for SRL Chrome Extension.
 * Here because variables need to be perserved after the popup closes.
 */

var tabID = -1;

/**
 * Opens the given URL to our tab.
 * We keep one universal tab for streams, so if it doesn't exist we make a new one.
 * Otherwise we update our current tab to reflect the newly clicked link.
 @param url The URL to use to open or update the tab.
 */
function openUrl(url)
{
  if (tabID == -1)
  {
    chrome.tabs.create({ "url": url }, onTabCreate);
    chrome.tabs.onRemoved.addListener(onTabClose);
  }
  else
  {
    chrome.tabs.update(tabID, { url: url, selected: true });
    return;
  }
}

/**
 * Deals with the tab being created by storing its ID.
 *@private
 */
function onTabCreate(tab)
{
  tabID = tab.id;
}

/**
 * Deals with the tab being closed by reseting the ID.
 *@private
 */
function onTabClose()
{
  tabId = -1;
}
