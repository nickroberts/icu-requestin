(function() {
  'use strict';

  angular.module('app')
    .controller('PopupController', PopupController);

  PopupController.$inject = ['$scope', 'moment', '$filter', '$window', 'toastr'];

  function PopupController($scope, moment, $filter, $window, toastr) {
    let vm = this;

    let _enabled = true;

    vm.toggleEnabled = toggleEnabled;
    vm.searchInSumologic = searchInSumologic;
    vm.copyDescription = copyDescription;
    vm.clear = clear;
    vm.remove = remove;

    Object.defineProperty(vm, 'enabled', {
      get: () => {
        return _enabled;
      },
      set: (value) => {
        _enabled = value;
        toggleEnabled(value);
      }
    });

    let background = chrome.extension.getBackgroundPage();

    addEventListener('unload', (e) => {
      background.popupClosed(e);
    }, true);

    activate();

    ////////////////

    function activate() {
      console.log('\'Allo \'Allo! Popup');
      loadOptions();
      buildResponses();
    }

    function loadOptions() {
      chrome.storage.local.get('options', (data) => {
        console.log('Options loaded', data.options);
        vm.options = data.options;
        $scope.$applyAsync();
      });
    }

    function buildResponses() {
      chrome.storage.local.get(['responses', 'enabled'], (storage) => {
        console.log('enabled', storage.enabled);
        console.log('responses', storage.responses);
        _enabled = storage.enabled;
        if (storage.responses) {
          vm.requests = [];
          for (let request in storage.responses) {
            if (storage.responses.hasOwnProperty(request)) {
              vm.requests.push(storage.responses[request]);
            }
          }
        }
        $scope.$applyAsync();
      });
    }

    function toggleEnabled(value) {
      console.log('toggleEnabled:', value);
      chrome.runtime.sendMessage({ action: 'toggleEnabled', value: value }, (response) => {
        console.log('got the toggleEnabled response:', response);
      });
    }

    function remove(request) {
      console.log('remove:', request);
      chrome.runtime.sendMessage({ action: 'remove', requestId: request.requestId }, (response) => {
        console.log('got the remove response:', response);
        buildResponses();
        $scope.$applyAsync();
      });
    }

    function clear() {
      console.log('clear:');
      chrome.runtime.sendMessage({ action: 'clear' }, (response) => {
        console.log('got the clear response:', response);
        vm.requests = null;
        $scope.$applyAsync();
      });
    }

    function _buildSumologicUrl(request) {
      // https://service.sumologic.com/ui/index.html#section/search/@<timeFrom>,<timeTo>@<searchString>
      let xRequestId = $filter('getHeaderValue')(request.response, 'x-request-id');
      if (xRequestId) {
        let fromTimestamp = moment(request.response.timeStamp).subtract(moment.duration(2, 'm'));
        let toTimestamp = moment(request.response.timeStamp).add(moment.duration(2, 'm'));
        return 'https://service.sumologic.com/ui/index.html#section/search/@' + fromTimestamp + ',' + toTimestamp + '@' + xRequestId;
      }
      return null;
    }

    function searchInSumologic(request) {
      let xRequestId = $filter('getHeaderValue')(request.response, 'x-request-id');
      if (xRequestId) {
        $window.open(_buildSumologicUrl(request));
      }
    }

    function copyDescription(request) {
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
        console.log('Copy email command was ' + msg);
        window.getSelection().removeAllRanges();
        document.body.removeChild(copyFrom);
        toastr.info('Check out your clipboard...', 'Aw-yea!');
      } catch(err) {
        console.error(err);
        console.log('Oops, unable to copy');
      }
    }
  }
})();