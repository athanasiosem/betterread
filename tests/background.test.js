const { getCssFile, toggleExtension, applyStyles, reapplyIfOn } = require('../js/background');

beforeEach(() => {
  chrome.storage.local.get.mockResolvedValue({ states: {} });
  chrome.storage.local.set.mockResolvedValue();
  chrome.scripting.insertCSS.mockResolvedValue();
  chrome.scripting.removeCSS.mockResolvedValue();
});

// ------------------------------------------------------------

describe('getCssFile', () => {
  test('returns site-specific CSS for a registered hostname', () => {
    expect(getCssFile('news.ycombinator.com')).toBe('css/sites/ycombinator.css');
  });

  test('falls back to styles.css for an unknown hostname', () => {
    expect(getCssFile('medium.com')).toBe('css/styles.css');
  });

  test('falls back to styles.css for an empty string', () => {
    expect(getCssFile('')).toBe('css/styles.css');
  });
});

// ------------------------------------------------------------

describe('toggleExtension', () => {
  test('ignores non-http URLs', async () => {
    await toggleExtension({ url: 'chrome://extensions/', id: 1 });

    expect(chrome.storage.local.get).not.toHaveBeenCalled();
    expect(chrome.scripting.insertCSS).not.toHaveBeenCalled();
  });

  test('ignores missing URL', async () => {
    await toggleExtension({ id: 1 });

    expect(chrome.storage.local.get).not.toHaveBeenCalled();
  });

  test('toggles from off to on and persists state', async () => {
    chrome.storage.local.get.mockResolvedValue({ states: {} });

    await toggleExtension({ id: 1, url: 'https://news.ycombinator.com/' });

    expect(chrome.scripting.insertCSS).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ['css/sites/ycombinator.css']
    });
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      states: { 'news.ycombinator.com': 'on' }
    });
  });

  test('toggles from on to off and persists state', async () => {
    chrome.storage.local.get.mockResolvedValue({
      states: { 'news.ycombinator.com': 'on' }
    });

    await toggleExtension({ id: 1, url: 'https://news.ycombinator.com/' });

    expect(chrome.scripting.removeCSS).toHaveBeenCalled();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      states: { 'news.ycombinator.com': 'off' }
    });
  });

  test('uses fallback CSS for unregistered hostname', async () => {
    await toggleExtension({ id: 1, url: 'https://medium.com/article' });

    expect(chrome.scripting.insertCSS).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ['css/styles.css']
    });
  });

  test('does not persist state if injection fails', async () => {
    chrome.scripting.insertCSS.mockRejectedValue(new Error('Protected page'));

    await toggleExtension({ id: 1, url: 'https://news.ycombinator.com/' });

    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });
});

// ------------------------------------------------------------

describe('applyStyles', () => {
  test('injects CSS and sets badge when turning on', async () => {
    const result = await applyStyles(1, 'on', 'news.ycombinator.com');

    expect(result).toBe(true);
    expect(chrome.scripting.insertCSS).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ['css/sites/ycombinator.css']
    });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: 'ON', tabId: 1 });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#22C55E',
      tabId: 1
    });
  });

  test('returns false and does not set badge if injection fails', async () => {
    chrome.scripting.insertCSS.mockRejectedValue(new Error('Protected page'));

    const result = await applyStyles(1, 'on', 'news.ycombinator.com');

    expect(result).toBe(false);
    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });

  test('uses fallback CSS for unknown hostname', async () => {
    await applyStyles(1, 'on', 'medium.com');

    expect(chrome.scripting.insertCSS).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ['css/styles.css']
    });
  });

  test('removes CSS and clears badge when turning off', async () => {
    const result = await applyStyles(1, 'off', 'news.ycombinator.com');

    expect(result).toBe(true);
    expect(chrome.scripting.removeCSS).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ['css/sites/ycombinator.css']
    });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '', tabId: 1 });
  });

  test('still clears badge even if removeCSS fails', async () => {
    chrome.scripting.removeCSS.mockRejectedValue(new Error('Already removed'));

    const result = await applyStyles(1, 'off', 'news.ycombinator.com');

    expect(result).toBe(true);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '', tabId: 1 });
  });
});

// ------------------------------------------------------------

describe('reapplyIfOn', () => {
  test('ignores non-http URLs', async () => {
    await reapplyIfOn(1, 'chrome://newtab/');

    expect(chrome.storage.local.get).not.toHaveBeenCalled();
    expect(chrome.scripting.insertCSS).not.toHaveBeenCalled();
  });

  test('ignores missing URL', async () => {
    await reapplyIfOn(1, undefined);

    expect(chrome.storage.local.get).not.toHaveBeenCalled();
  });

  test('injects CSS when state is on', async () => {
    chrome.storage.local.get.mockResolvedValue({
      states: { 'news.ycombinator.com': 'on' }
    });

    await reapplyIfOn(1, 'https://news.ycombinator.com/');

    expect(chrome.scripting.insertCSS).toHaveBeenCalled();
  });

  test('skips injection when state is off', async () => {
    chrome.storage.local.get.mockResolvedValue({
      states: { 'news.ycombinator.com': 'off' }
    });

    await reapplyIfOn(1, 'https://news.ycombinator.com/');

    expect(chrome.scripting.insertCSS).not.toHaveBeenCalled();
  });

  test('skips injection when no state exists for hostname', async () => {
    chrome.storage.local.get.mockResolvedValue({ states: {} });

    await reapplyIfOn(1, 'https://medium.com/');

    expect(chrome.scripting.insertCSS).not.toHaveBeenCalled();
  });
});
