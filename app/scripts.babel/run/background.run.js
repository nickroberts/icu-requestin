(function() {
  'use strict';

  angular.module('app')
    .run(runBlock);

  runBlock.$inject = ['$log', 'defaultOptions', 'isError'];

  function runBlock($log, defaultOptions, isError) {
    $log.debug('Running!');

    let _enabled = false;
    let _options = null;
    let _headerStore = {};

    activate();

    ////////////////

    function activate() {
      $log.debug('Background, activate!');

      // Iniitalize default options
      chrome.storage.local.get('options', (storage) => {
        if (!storage.options) {
          chrome.storage.local.set({ options: defaultOptions }, () => {
            $log.debug('Default options initialized.', defaultOptions);
            _options = defaultOptions;
            enable();
          });
        } else {
          _options = storage.options;
          $log.debug('Options have been created already.', storage.options);
          enable();
        }
      });
    }

    function enable() {
      $log.debug('enable()');
      chrome.storage.local.get('enabled', (storage) => {
        if (angular.isUndefined(storage.enabled)) {
          chrome.storage.local.set({ enabled: true }, () => {
            $log.debug('Enabled was undefined, setting it to true');
            _enabled = true;
            initialize();
          });
        } else {
          _enabled = storage.enabled;
          initialize();
        }
      });
    }

    function initialize() {
      $log.debug('initialize()');

      // Setup message listener
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        $log.debug('Received a message: ', message);
        if (message.action === 'toggleEnabled') {
          $log.debug('Action: toggleEnabled:', message.value);
          if (message.value) {
            on();
          } else {
            off();
          }
        } else if (message.action === 'clear') {
          $log.debug('Action: clear');
          _headerStore = {};
          chrome.storage.local.remove('requests');
          clearBadgeText();
        } else if (message.action === 'remove' && message.requestId) {
          $log.debug('Action: remove:', message.requestId, _headerStore[message.requestId]);
          delete _headerStore[message.requestId];
          chrome.storage.local.set({ requests: _headerStore }, () => {
            $log.debug('Saved requests.');
          });
          setBadgeText();
        }
        chrome.tabs.query({ active: true }, (tabs) => {
          $log.debug('Sending message response for ', message.action, message.value);
          sendResponse({ tabUrl: tabs[0].url });
        });
      });

      chrome.storage.local.get('requests', (storage) => {
        $log.debug('Loaded requests:', storage.requests);
        if (storage.requests) {
          _headerStore = storage.requests;
        }
        setBadgeText();
      });

      if (_enabled) {
        on();
      }
    }

    function on() {
      $log.debug('on()');
      chrome.webRequest.onHeadersReceived.addListener(onHeadersReceivedListener, {
        urls: _options.urls,
        types: ['main_frame', 'sub_frame', 'xmlhttprequest']
      },
      ['responseHeaders', 'blocking']);
      chrome.webRequest.onSendHeaders.addListener(onSendHeadersListener, {
        urls: _options.urls,
        types: ['main_frame', 'sub_frame', 'xmlhttprequest']
      },
      ['requestHeaders']);
      chrome.storage.local.set({ enabled: true }, () => {
        $log.debug('Enabled set to true.');
      });
    }

    function off() {
      $log.debug('off()');
      chrome.browserAction.setIcon({
        path : {
          '19': 'images/icons/off/icon-19.png',
          '38': 'images/icons/off/icon-38.png'
        }
      });
      chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceivedListener);
      chrome.webRequest.onSendHeaders.removeListener(onSendHeadersListener);
      chrome.storage.local.set({ enabled: false }, () => {
        $log.debug('Enabled set to false.');
      });
      clearBadgeText();
    }

    function onHeadersReceivedListener(data) {
      $log.debug('onHeadersReceivedListener()', data);
      _headerStore[data.requestId].response = data;
      _headerStore[data.requestId].status = data.statusCode;

      chrome.storage.local.set({ requests: _headerStore }, () => {
        $log.debug('Requests saved', _headerStore);
      });

      setBadgeText();
    }

    function onSendHeadersListener(data) {
      $log.debug('onSendHeadersListener()', data);
      if (typeof(_headerStore[data.requestId]) === 'undefined') {
        _headerStore[data.requestId] = {
          requestId: data.requestId,
          status: null,
          request: null,
          response: null
        };
      }
      _headerStore[data.requestId].request = data;
    }

    function setBadgeText(value = null) {
      $log.debug('setBadgeText()', value);
      // Only show errors in the extension badge
      let numberOfErrors = 0;
      for (let r in _headerStore) {
        if (_headerStore.hasOwnProperty(r) && isError(_headerStore[r])) {
          numberOfErrors++;
        }
      }
      if (value) {
        chrome.browserAction.setBadgeText({
          text: value ? value.toString() : (Object.keys(_headerStore).length > 0 ? Object.keys(_headerStore).length.toString() : '')
        });
      } else {
        chrome.browserAction.setBadgeText({
          text: numberOfErrors > 0 ? numberOfErrors.toString() : ''
        });
      }
    }

    function clearBadgeText() {
      $log.debug('clearBadgeText()');
      chrome.browserAction.setBadgeText({ text: '' });
    }
  }
})();