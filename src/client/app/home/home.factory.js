(function() {
  'use strict';
  angular.module('app.home')
    .factory('Home', Home);

  Home.$inject = ['$http', 'store', '$mdSidenav'];

  function Home($http, store, $mdSidenav) {

    var services = {
      date: date,
      dateSetter: dateSetter,
      getDay: getDay,
      getUserData: getUserData
    };
    return services;

    function getUserData() {
      var profile = store.get('profile');
      return $http({
          method: 'POST',
          url: '/user',
          data: {
            email: profile.email,
            firstname: profile.given_name,
            lastname: profile.family_name
          }
        })
        .then(function(returnedData) {
          store.set('userData', returnedData.data);
        });
    };

    function getDay(date) {
      var user = JSON.parse(window.localStorage.getItem('userData'));
      for (var x = 0; x < user.days.length; x++) {
        var day = user.days[x];
        if (day.date === date) {
          return day;
        }
      }
    };

    var date = {};

    var userLocation = {};

    function dateSetter(value) {
      services.date = value;
    }

    function locSetter(value) {
      services.userLocation = value;
    }
    
  }
})();
