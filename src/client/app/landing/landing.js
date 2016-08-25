(function () {
  'use strict';
  angular.module('app.landing', []).controller('LandingController',
    LandingController).factory('Auth', Auth);

  function LandingController ($location, auth, $scope) {
    // jshint validthis: true
    var landing = this;
    landing.auth = auth;
  }

  function Auth (auth, $location) {
    var services = {};

    services.logout = function () {
      auth.signout();
      window.localStorage.removeItem('profile');
      window.localStorage.removeItem('token');
      console.log("Log out successful")
      $location.path('#');
    };

    return services;
  }


})();
