(function() {
  'use strict';

  angular.module('app')
    .controller('OptionsController', OptionsController);

  OptionsController.$inject = ['$scope', 'toastr'];

  function OptionsController($scope, toastr) {
    let vm = this;

    // TODO: this needs to be in one place
    const DEFAULTS = {
      urls: [
        'http://*/*',
        'https://*/*'
      ],
      theme: null
    };

    vm.reset = reset;
    vm.save = save;
    vm.resetAllToDefault = resetAllToDefault;
    vm.resetOptionToDefault = resetOptionToDefault;
    vm.originalOptions = null;
    vm.options = null;

    vm.availableUrls = [
      'http://*/*',
      'https://*/*',
      '<all_urls>'
    ];

    vm.availableThemes = [
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
    ];

    vm.theme = null;

    activate();

    ////////////////

    function activate() {
      console.log('\'Allo \'Allo! Options');
      loadOptions();
    }

    // TODO: put all of the options (and chrome calls?!?) in a service

    function loadOptions() {
      chrome.storage.local.get('options', (data) => {
        console.log(data.options);
        vm.options = data.options;
        vm.originalOptions = angular.copy(data.options);
        $scope.$applyAsync();
      });
    }

    function resetAllToDefault() {
      console.log('Reset all to default');
      vm.options = angular.copy(DEFAULTS);
    }

    function resetOptionToDefault(key) {
      console.log('Reset ' + key + ' to default');
      vm.options[key] = getDefaultOption(key);
    }

    function getDefaultOption(key) {
      return DEFAULTS[key];
    }

    function reset() {
      console.log('Reset options');
      vm.options = angular.copy(vm.originalOptions);
    }

    function save() {
      if (vm.optionsForm.$valid) {
        console.log('Save options', vm.options);
        chrome.storage.local.set({ options: vm.options }, () => {
          console.log('Options have been saved');
          toastr.success('Your options have been saved...', 'Boom!');
          vm.originalOptions = angular.copy(vm.options);
        });
      } else {
        console.log('Options form is invalid');
      }
    }
  }
})();