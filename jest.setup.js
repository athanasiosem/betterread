global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  scripting: {
    insertCSS: jest.fn(),
    removeCSS: jest.fn()
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
    onClicked: { addListener: jest.fn() }
  },
  tabs: {
    onUpdated: { addListener: jest.fn() }
  },
  webNavigation: {
    onHistoryStateUpdated: { addListener: jest.fn() }
  }
};
