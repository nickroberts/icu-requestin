(function() {
  'use strict';
  angular.module('app')
    .filter('reverse', ReverseFilter);
  function ReverseFilter() {
    return function(items) {
      return items && items.length ? items.slice().reverse() : null;
    };
  }
})();