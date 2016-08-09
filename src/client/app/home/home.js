(function() {
  'use strict';
  angular.module('app.home', ['app.home.entries', 'app.home.insights',
    'app.home.journal'
  ]).controller('HomeController', HomeController).factory('homeFactory',
    homeFactory);

  function HomeController($scope) {
    /*jshint validthis: true */
    var home = this;
  }

  function homeFactory($http, store) {
    var services = {};
    services.getUserData = function() {
      var profile = store.get('profile');
      return $http({
        method: "POST",
        url: '/user',
        email: profile.email,
        firstname: profile.given_name,
        lastname: profile.family_name
      }).then(function(returnedData) {
        store.set('userData', returnedData.data);
      })
    }
    return services;
  }
})();
