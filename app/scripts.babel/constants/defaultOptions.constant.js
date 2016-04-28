(function() {
  'use strict';
  angular.module('app')
    .constant('defaultOptions', {
      urls: [
        'http://*/*',
        'https://*/*'
      ],
      theme: null,
      showOnlyErrors: true
    });
})();