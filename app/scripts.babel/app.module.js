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
    ])
    .constant('isError', isError);

  appConfig.$inject = ['$logProvider'];
  function appConfig($logProvider) {
    // Pass true to enable logging
    $logProvider.debugEnabled(true);
  }

  function isError(request) {
    return !request || !request.response || !request.response.statusCode ?
      false :
      /(400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|500|501|502|503|504|505)/g.test(request.response.statusCode.toString());
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