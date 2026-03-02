const SITE_RULES = {
  'news.ycombinator.com': 'css/sites/ycombinator.css',
};

function getCssFile(hostname) {
  return SITE_RULES[hostname] ?? 'css/styles.css';
}

async function toggleExtension(tab) {
  if (!tab.url?.startsWith('http')) return;

  const hostname = new URL(tab.url).hostname;
  const data = await chrome.storage.local.get('states');
  const states = data.states || {};
  const currentState = states[hostname] || 'off';
  const newState = currentState === 'on' ? 'off' : 'on';

  states[hostname] = newState;
  await chrome.storage.local.set({ states });

  applyStyles(tab.id, newState, hostname);
}

async function applyStyles(tabId, state, hostname) {
  const cssFile = getCssFile(hostname);

  if (state === 'on') {
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: [cssFile]
      });
      chrome.action.setBadgeText({ text: "ON", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#22C55E", tabId: tabId });
    } catch (err) {
      console.error("Injection failed (likely a protected Chrome page):", err);
    }
  } else {
    chrome.action.setBadgeText({ text: "", tabId: tabId });

    try {
      await chrome.scripting.removeCSS({
        target: { tabId: tabId },
        files: [cssFile]
      });
    } catch (err) {
      console.warn("Could not remove CSS:", err);
    }
  }
}

chrome.action.onClicked.addListener((tab) => {
  toggleExtension(tab);
});

async function reapplyIfOn(tabId, url) {
  if (!url?.startsWith('http')) return;
  const hostname = new URL(url).hostname;
  const data = await chrome.storage.local.get('states');
  const states = data.states || {};
  if (states[hostname] === 'on') {
    applyStyles(tabId, 'on', hostname);
  }
}

// Full page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    reapplyIfOn(tabId, tab.url);
  }
});

// SPA / pushState navigation (e.g. Reddit, Medium)
chrome.webNavigation.onHistoryStateUpdated.addListener(({ tabId, url }) => {
  reapplyIfOn(tabId, url);
});
