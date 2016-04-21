(function() {
  'use strict';
  angular.module('app', ['ui.bootstrap', 'ui.select', 'angularMoment'])
    .filter('reverse', ReverseFilter)
    .filter('removeQueryStringParams', RemoveQueryStringParamsFilter)
    .filter('getHeaderValue', GetHeaderValueFilter)
    .constant('toastr', toastr);

  function ReverseFilter() {
    return function(items) {
      return items && items.length ? items.slice().reverse() : null;
    };
  }

  function RemoveQueryStringParamsFilter() {
    return function(input) {
      return input.replace(/\?.*$/g, '');
    };
  }

  function GetHeaderValueFilter() {
    return function(input, key) {
      try {
        console.log(input.responseHeaders.find((header) => {
          return header.name === key;
        }).value);
        return input.responseHeaders.find((header) => {
          return header.name === key;
        }).value;
      } catch (e) {
        return null;
      }
    };
  }
})();