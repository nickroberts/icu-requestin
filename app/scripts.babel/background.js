'use strict';

const URLS = [
  'http://*/*',
  'https://*/*'
];

let headerStore = {};

console.log('\'Allo \'Allo! Event Page for Browser Action');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Got a message: ', message);
  if (message.action === 'toggleEnabled') {
    console.log('sent toggleEnabled:', message.value);
    if (message.value) {
      enable();
    } else {
      disable();
    }
  } else if (message.action === 'clear') {
    console.log('sent clear:');
    headerStore = {};
    chrome.storage.local.remove('responses');
    clearBadgeText();
  } else if (message.action === 'remove' && message.requestId) {
    console.log('sent remove:', message.requestId, headerStore[message.requestId]);
    delete headerStore[message.requestId];
    chrome.storage.local.set({ responses: headerStore }, () => {
      console.log('headerStore saved');
    });
    setBadgeText();
  }
  chrome.tabs.query({ active: true }, (tabs) => {
    sendResponse({ tabUrl: tabs[0].url });
  });
});

function onHeadersReceivedListener(info) {
  console.log('onHeadersReceivedListener', info);

  if (isError(info)) {
    headerStore[info.requestId].response = info;
    headerStore[info.requestId].status = info.statusCode;
  }

  for (let r in headerStore) {
    if (headerStore.hasOwnProperty(r) && !headerStore[r].response) {
      delete headerStore[r];
    }
  }

  chrome.storage.local.set({ responses: headerStore }, () => {
    console.log('headerStore saved');
  });

  setBadgeText();
}

function onSendHeadersListener(info) {
  console.log('onSendHeadersListener', info);
  if (typeof(headerStore) === 'undefined') {
    headerStore = {};
  }
  if (typeof(headerStore[info.requestId]) === 'undefined') {
    headerStore[info.requestId] = {
      requestId: info.requestId,
      status: null,
      request: null,
      response: null
    };
  }
  headerStore[info.requestId].request = info;
}

function enable() {
  chrome.browserAction.setIcon({
    path : {
      '19': 'images/icons/on/icon-19.png',
      '38': 'images/icons/on/icon-38.png'
    }
  });
  chrome.webRequest.onHeadersReceived.addListener(onHeadersReceivedListener, {
    urls: URLS,
    types: ['main_frame', 'sub_frame', 'xmlhttprequest']
  },
  ['responseHeaders', 'blocking']);
  chrome.webRequest.onSendHeaders.addListener(onSendHeadersListener, {
    urls: URLS,
    types: ['main_frame', 'sub_frame', 'xmlhttprequest']
  },
  ['requestHeaders']);
  chrome.storage.local.set({ enabled: true }, () => {
    console.log('enabled saved', true);
  });
  setBadgeText();
}

function disable() {
  chrome.browserAction.setIcon({
    path : {
      '19': 'images/icons/off/icon-19.png',
      '38': 'images/icons/off/icon-38.png'
    }
  });
  chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceivedListener);
  chrome.webRequest.onSendHeaders.removeListener(onSendHeadersListener);
  chrome.storage.local.set({ enabled: false }, () => {
    console.log('enabled saved', false);
  });
  clearBadgeText();
}

function setBadgeText() {
  console.log('setBadgeText');
  chrome.browserAction.setBadgeText({
    text: Object.keys(headerStore).length > 0 ? Object.keys(headerStore).length.toString() : ''
  });
}

function clearBadgeText() {
  console.log('clearBadgeText');
  chrome.browserAction.setBadgeText({ text: '' });
}

function isError(info) {
  return !info || !info.statusCode ?
    false :
    info.statusCode.toString().match(/(400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|500|501|502|503|504|505)/g);
}

function popupClosed() {// eslint-disable-line no-unused-vars
  console.log('popupClosed');
}

function load() {
  chrome.storage.local.get('responses', (data) => {
    console.log('get responses', data.responses);
    headerStore = data.responses;
    enable();
  });
}

chrome.storage.local.get('enabled', (data) => {
  if (typeof data.enabled !== 'boolean' || data.enabled) {
    load();
  } else {
    disable();
  }
});