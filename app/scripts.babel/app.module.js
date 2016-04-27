(function() {
  'use strict';

  // TODO: split out filters, constants

  angular.module('app', ['ui.bootstrap', 'ui.select', 'angularMoment'])
    .config(appConfig)
    .filter('reverse', ReverseFilter)
    .filter('removeQueryStringParams', RemoveQueryStringParamsFilter)
    .filter('getHeaderValue', GetHeaderValueFilter)
    .constant('toastr', toastr)
    .constant('defaultOptions', {
      urls: [
        'http://*/*',
        'https://*/*'
      ],
      theme: null,
      showOnlyErrors: true
    })
    .constant('availableThemes', [
      { name: 'Cerulean', value: 'cerulean' },
      { name: 'Cosmo', value: 'cosmo' },
      { name: 'Cyborg', value: 'cyborg' },
      { name: 'Darkly', value: 'darkly' },
      { name: 'Default', value: null },
      { name: 'Flatly', value: 'flatly' },
      { name: 'Journal', value: 'journal' },
      { name: 'Lumen', value: 'lumen' },
      { name: 'Paper', value: 'paper' },
      { name: 'Readable', value: 'readable' },
      { name: 'Sandstone', value: 'sandstone' },
      { name: 'Simplex', value: 'simplex' },
      { name: 'Slate', value: 'slate' },
      { name: 'Spacelab', value: 'spacelab' },
      { name: 'Superhero', value: 'superhero' },
      { name: 'United', value: 'united' },
      { name: 'Yeti', value: 'yeti' }
    ]);

  appConfig.$inject = ['$logProvider'];
  function appConfig($logProvider) {
    // Pass true to enable logging
    $logProvider.debugEnabled(true);
  }

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
        return input.responseHeaders.find((header) => {
          return header.name === key;
        }).value;
      } catch (e) {
        return null;
      }
    };
  }
})();