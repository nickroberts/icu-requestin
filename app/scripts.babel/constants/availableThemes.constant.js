(function() {
  'use strict';
  angular.module('app')
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
})();