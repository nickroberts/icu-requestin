(function() {
  'use strict';
  angular.module('app', ['ui.bootstrap', 'ui.select', 'angularMoment', 'angulartics', 'angulartics.google.analytics'])
    .config(appConfig);
  appConfig.$inject = ['$logProvider'];
  function appConfig($logProvider) {
    // Pass true to enable logging
    $logProvider.debugEnabled(true);
  }
})();
