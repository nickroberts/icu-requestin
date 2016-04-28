(function() {
  'use strict';
  angular.module('app')
    .filter('getHeaderValue', GetHeaderValueFilter);
  function GetHeaderValueFilter() {
    return function(input, key) {
      try {
        return input.responseHeaders.find((header) => {
          return header.name === key;
        }).value;
      } catch (e) {
        return null;
      }
    };
  }
})();