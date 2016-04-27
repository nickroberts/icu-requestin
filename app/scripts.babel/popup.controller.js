(function() {
  'use strict';

  angular.module('app')
    .controller('PopupController', PopupController);

  PopupController.$inject = ['$log', '$scope', 'moment', '$filter', '$window', 'toastr', 'isError'];

  function PopupController($log, $scope, moment, $filter, $window, toastr, isError) {
    let vm = this;
    let _enabled;
    let _showOnlyErrors;

    vm.toggleEnabled = toggleEnabled;
    vm.searchInSumologic = searchInSumologic;
    vm.copyDescription = copyDescription;
    vm.clear = clear;
    vm.remove = remove;

    Object.defineProperties(vm, {
      enabled: {
        get: () => {
          return _enabled;
        },
        set: (value) => {
          _enabled = value;
          toggleEnabled(value);
        }
      },
      showOnlyErrors: {
        get: () => {
          return _showOnlyErrors;
        },
        set: (value) => {
          _showOnlyErrors = value;
          vm.options.showOnlyErrors = value;
          saveOptions();
        }
      }
    });

    activate();

    ////////////////

    function activate() {
      $log.debug('Popup, activate!');
      loadOptions();
    }

    function loadOptions() {
      $log.debug('loadOptions()');
      chrome.storage.local.get('options', (storage) => {
        $log.debug('Options loaded', storage.options);
        vm.options = storage.options;
        _showOnlyErrors = storage.options.showOnlyErrors;
        $scope.$applyAsync();
      });
      buildRequests();
    }

    function saveOptions() {
      $log.debug('saveOptions()');
      chrome.storage.local.set({ options: vm.options }, () => {
        $log.debug('Saved options.', vm.options);
      });
    }

    function buildRequests() {
      $log.debug('buildRequests()');
      chrome.storage.local.get(['enabled', 'requests'], (storage) => {
        $log.debug('Loaded enabled:', storage.enabled);
        $log.debug('Loaded requests:', storage.requests);
        _enabled = storage.enabled;
        if (storage.requests) {
          vm.requests = [];
          for (let request in storage.requests) {
            if (storage.requests.hasOwnProperty(request)) {
              // TODO: maybe move these to where it gets the response
              storage.requests[request].isError = isError(storage.requests[request]);
              storage.requests[request].xRequestId = $filter('getHeaderValue')(request.response, 'x-request-id');
              vm.requests.push(storage.requests[request]);
            }
          }
        }
        $log.debug('Built requests:', vm.requests);
        $scope.$applyAsync();
      });
    }

    function toggleEnabled(value) {
      $log.debug('toggleEnabled()', value);
      chrome.runtime.sendMessage({ action: 'toggleEnabled', value: value }, (response) => {
        $log.debug('Received the toggleEnabled response:', response);
      });
    }

    function remove(request) {
      $log.debug('remove()', request);
      chrome.runtime.sendMessage({ action: 'remove', requestId: request.requestId }, (response) => {
        $log.debug('Received the remove response:', response);
        buildRequests();
        $scope.$applyAsync();
      });
    }

    function clear() {
      $log.debug('clear()');
      chrome.runtime.sendMessage({ action: 'clear' }, (response) => {
        $log.debug('Received the clear response:', response);
        vm.requests = null;
        $scope.$applyAsync();
      });
    }

    function _buildSumologicUrl(request) {
      $log.debug('_buildSumologicUrl()');
      // Format: https://service.sumologic.com/ui/index.html#section/search/@<timeFrom>,<timeTo>@<searchString>
      if (request.xRequestId) {
        let fromTimestamp = moment(request.response.timeStamp).subtract(moment.duration(2, 'm'));
        let toTimestamp = moment(request.response.timeStamp).add(moment.duration(2, 'm'));
        return 'https://service.sumologic.com/ui/index.html#section/search/@' + fromTimestamp + ',' + toTimestamp + '@' + request.xRequestId;
      }
      return null;
    }

    function searchInSumologic(request) {
      $log.debug('searchInSumologic()');
      if (request.xRequestId) {
        $window.open(_buildSumologicUrl(request));
      }
    }

    function copyDescription(request) {
      $log.debug('copyDescription()');
      try {
        let content = `${request.response.url}\n` +
          `${$filter('amDateFormat', 'M-D-YYYY, h:mm:ss a')(request.response.timeStamp)}\n` +
          `Method: ${request.response.method}\n` +
          `Status: ${request.response.statusLine}\n`;

        let sumologicUrl = _buildSumologicUrl(request);
        if (sumologicUrl) {
          `Sumologic Search URL: ${sumologicUrl}\n`;
        }

        content += `\nRequest:\n`;
        for (let header in request.request.requestHeaders) {
          if (request.request.requestHeaders.hasOwnProperty(header)) {
            content += `${request.request.requestHeaders[header].name}: ${request.request.requestHeaders[header].value}\n`;
          }
        }

        content += `\nResponse:\n`;
        for (let header in request.response.responseHeaders) {
          if (request.response.responseHeaders.hasOwnProperty(header)) {
            content += `${request.response.responseHeaders[header].name}: ${request.response.responseHeaders[header].value}\n`;
          }
        }

        let copyFrom = document.createElement('textarea');
        copyFrom.textContent = content;
        document.body.appendChild(copyFrom);
        let range = document.createRange();
        range.selectNode(copyFrom);
        window.getSelection().addRange(range);
        let successful = document.execCommand('copy');
        let msg = successful ? 'successful' : 'unsuccessful';
        $log.debug('Copy email command was ' + msg);
        window.getSelection().removeAllRanges();
        document.body.removeChild(copyFrom);
        toastr.success('Check out your clipboard...', 'Aw-yea!');
      } catch(err) {
        $log.debug('Oh-no! Unable to copy to the clipboard.', err);
        toastr.error('We were unable to copy to your clipboard...', 'Oh-no!');
      }
    }
  }
})();