import { tldLocales } from './locales.js'

chrome.runtime.onInstalled.addListener(function () {
    const item = {
        notepad: 'Welcome to <b>Chrome Notepad</b>!&nbsp;<div><br></div><div><b><u>COMMANDS</u></b>:</div><div>- Ctrl+B for <b>bold</b></div><div>- Ctrl+U for <u>underline</u><br></div><div>- Ctrl+I for&nbsp;<i>italic</i></div><div><br></div><div>Text will be automatically saved every time a key is pressed.</div>',
        text: 'black',
        background: 'yellow'
    };
    chrome.storage.local.set(item, function () {
        console.log("Notepad initialized", item);
    });

    for (let [tld, locale] of Object.entries(tldLocales)) {
    chrome.contextMenus.create({
      id: tld,
      title: locale,
      type: 'normal',
      contexts: ['selection'],
    });
  }

});


// Open a new search tab when the user clicks a context menu
chrome.contextMenus.onClicked.addListener((item, tab) => {
  const tld = item.menuItemId
  let url = new URL(`https://google.${tld}/search`)
  url.searchParams.set('q', item.selectionText)
  chrome.tabs.create({ url: url.href, index: tab.index + 1 });
});

// Add or removes the locale from context menu
// when the user checks or unchecks the locale in the popup
chrome.storage.onChanged.addListener(({ enabledTlds }) => {
  if (typeof enabledTlds === 'undefined') return

  let allTlds = Object.keys(tldLocales)
  let currentTlds = new Set(enabledTlds.newValue);
  let oldTlds = new Set(enabledTlds.oldValue ?? allTlds);
  let changes = allTlds.map((tld) => ({
    tld,
    added: currentTlds.has(tld) && !oldTlds.has(tld),
    removed: !currentTlds.has(tld) && oldTlds.has(tld)
  }))

  for (let { tld, added, removed } of changes) {
    if (added) {
      chrome.contextMenus.create({
        id: tld,
        title: tldLocales[tld],
        type: 'normal',
        contexts: ['selection'],
      });
    }
    else if (removed) {
      chrome.contextMenus.remove(tld);
    }
  }

});





