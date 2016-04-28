(function() {
  'use strict';
  angular.module('app')
    .constant('isError', isError);
  function isError(request) {
    return !request || !request.response || !request.response.statusCode ?
      false :
      /(400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417|500|501|502|503|504|505)/g.test(request.response.statusCode.toString());
  }
})();