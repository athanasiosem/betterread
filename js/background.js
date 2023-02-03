// background.js

//When the tab bar icon is clicked this code runs. It sets the state of the extension.
chrome.action.onClicked.addListener(async (tab) => {

  chrome.storage.local.get('state', async function (data) {

    if (data.state == 'on') {
      //Save the state of the extension.
      chrome.action.setBadgeText({ text: "On" });
      chrome.storage.local.set({ state: 'off' });

      try {
        await chrome.scripting.insertCSS({
          target: {
            tabId: tab.id,
          },
          files: ["css/styles.css"],
        });
      } catch (err) {
        console.error(`failed to insert CSS: ${err}`);
      }
    } else {
      //Save the state of the extension.
      chrome.action.setBadgeText({ text: "Off" });
      chrome.storage.local.set({ state: 'on' })

      try {
        await chrome.scripting.removeCSS({
          target: {
            tabId: tab.id,
          },
          files: ["css/styles.css"],
        });
      } catch (err) {
        console.error(`failed to remove CSS: ${err}`);
      }
    }

  });
});