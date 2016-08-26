(function() {
  'use strict';
  angular.module('app.home')
    .factory('Home', Home);

  Home.$inject = ['$http', 'store', '$mdSidenav', '$rootScope', '$state', '$stateParams'];

  function Home($http, store, $mdSidenav, $rootScope, $state, $stateParams) {

    var services = {
      date: date,
      dateSetter: dateSetter,
      locSetter: locSetter,
      getDay: getDay,
      getUserData: getUserData,
      userLocation: userLocation
      
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


    var userLocation = {};

    function locSetter(position) {
      services.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    };

    var date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()

    function dateSetter(value) {
      console.log(value)
      services.date = value;
    }

  }
})();
