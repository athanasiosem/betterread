// Toggle state and update the tab
async function toggleExtension(tab) {
  // 1. Get current state (default to 'off' if undefined)
  const data = await chrome.storage.local.get('state');
  const currentState = data.state || 'off';
  const newState = currentState === 'on' ? 'off' : 'on';

  // 2. Save the new state
  await chrome.storage.local.set({ state: newState });

  // 3. Apply changes
  applyStyles(tab.id, newState);
}

// Function to handle the actual injection/removal
async function applyStyles(tabId, state) {
  if (state === 'on') {
    // Set badge to ON
    chrome.action.setBadgeText({ text: "ON", tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#22C55E", tabId: tabId });

    // Inject CSS (Using a file reference)
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["css/styles.css"]
      });
    } catch (err) {
      console.error("Injection failed (likely a protected Chrome page):", err);
    }
  } else {
    // Set badge to OFF (empty string hides it)
    chrome.action.setBadgeText({ text: "", tabId: tabId });

    try {
      await chrome.scripting.removeCSS({
        target: { tabId: tabId },
        files: ["css/styles.css"]
      });
    } catch (err) {
      console.warn("Could not remove CSS:", err);
    }
  }
}

// Listener: When the icon is clicked
chrome.action.onClicked.addListener((tab) => {
  toggleExtension(tab);
});

// Listener: Re-apply styles when a tab is refreshed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    const data = await chrome.storage.local.get('state');
    if (data.state === 'on') {
      applyStyles(tabId, 'on');
    }
  }
});
