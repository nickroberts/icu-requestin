(function() {
  'use strict';

  angular.module('app')
    .controller('OptionsController', OptionsController);

  OptionsController.$inject = ['$log', '$scope', 'toastr', 'defaultOptions', 'availableUrls', 'availableThemes'];

  function OptionsController($log, $scope, toastr, defaultOptions, availableUrls, availableThemes) {
    let vm = this;
    let _enabled;

    vm.reset = reset;
    vm.save = save;
    vm.resetAllToDefault = resetAllToDefault;
    vm.resetOptionToDefault = resetOptionToDefault;
    vm.originalOptions = null;
    vm.options = null;
    vm.availableUrls = availableUrls;
    vm.availableThemes = availableThemes;
    vm.theme = null;

    Object.defineProperties(vm, {
      enabled: {
        get: () => {
          return _enabled;
        },
        set: (value) => {
          _enabled = value;
          toggleEnabled(value);
        }
      }
    });

    activate();

    ////////////////

    function activate() {
      $log.debug('Options, activate!');
      loadOptions();
    }

    function toggleEnabled(value) {
      $log.debug('toggleEnabled()', value);
      chrome.runtime.sendMessage({ action: 'toggleEnabled', value: value }, (response) => {
        $log.debug('Received the toggleEnabled response:', response);
      });
    }

    function loadOptions() {
      $log.debug('loadOptions()');
      chrome.storage.local.get(['options', 'enabled'], (storage) => {
        $log.debug('Options and enabled have been loaded', storage.options);
        _enabled = storage.enabled;
        vm.options = storage.options;
        vm.originalOptions = angular.copy(storage.options);
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