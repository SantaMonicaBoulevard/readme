(function() {
  'use strict';
  angular.module('app.home.entries')
  .factory('Entries', Entries);

    Entries.$inject = ['$http', 'Home'];

    function Entries ($http, Home) {

      var services = {
        weatherObtained: weatherObtained,
        getWeather: getWeather
      };
      return services;

      var weatherObtained = false;

      function getWeather () {
        if (!weatherObtained){
          $http.get('http://api.wunderground.com/api/921c08ecbdcbf50c/history_20100405/q/37.776289,-122.395234.json')
        }
      };
    }
  })();