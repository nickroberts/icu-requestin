(function() {
  'use strict';

  angular.module('app')
    .controller('OptionsController', OptionsController);

  OptionsController.$inject = ['$log', '$scope', 'toastr', 'defaultOptions', 'availableUrls', 'availableThemes'];

  function OptionsController($log, $scope, toastr, defaultOptions, availableUrls, availableThemes) {
    let vm = this;

    vm.reset = reset;
    vm.save = save;
    vm.resetAllToDefault = resetAllToDefault;
    vm.resetOptionToDefault = resetOptionToDefault;
    vm.originalOptions = null;
    vm.options = null;

    vm.availableUrls = availableUrls;
    vm.availableThemes = availableThemes;

    vm.theme = null;

    activate();

    ////////////////

    function activate() {
      $log.debug('Options, activate!');
      loadOptions();
    }

    // TODO: put all of the options (and chrome calls?!?) in a service

    function loadOptions() {
      $log.debug('loadOptions()');
      chrome.storage.local.get('options', (data) => {
        $log.debug('Options have been loaded', data.options);
        vm.options = data.options;
        vm.originalOptions = angular.copy(data.options);
        $scope.$applyAsync();
      });
    }

    function resetAllToDefault() {
      $log.debug('resetAllToDefault()');
      vm.options = angular.copy(defaultOptions);
    }

    function resetOptionToDefault(key) {
      $log.debug('resetOptionToDefault()', key);
      vm.options[key] = getDefaultOption(key);
    }

    function getDefaultOption(key) {
      $log.debug('getDefaultOption()');
      return defaultOptions[key];
    }

    function reset() {
      $log.debug('reset()');
      vm.options = angular.copy(vm.originalOptions);
    }

    function save() {
      $log.debug('save()');
      if (vm.optionsForm.$valid) {
        chrome.storage.local.set({ options: vm.options }, () => {
          $log.debug('Options have been saved');
          toastr.success('Your options have been saved...', 'Boom!');
          vm.originalOptions = angular.copy(vm.options);
        });
      } else {
        $log.debug('Options form is invalid');
        toastr.error('Your options form is invalid...', 'Oh-no!!');
      }
    }
  }
})();