(function() {
  'use strict';
  angular.module('app')
    .filter('removeQueryStringParams', RemoveQueryStringParamsFilter);
  function RemoveQueryStringParamsFilter() {
    return function(input) {
      return input.replace(/\?.*$/g, '');
    };
  }
})();