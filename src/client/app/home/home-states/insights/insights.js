(function() {
  'use strict';
  angular.module('app.home.insights', []).controller('InsightsController', InsightsController);

  function InsightsController($scope, Home, $http, store, Insights, $rootScope) {
    /*jshint validthis: true */
    var insights = this;
    insights.switch = false;
    insights.showSVG = false;
    insights.width = $(window).width() * 0.45;
    insights.height = 700;
    insights.userMetrics = store.get('userData').userMetrics;
    insights.currentCorrelationData = [{
      'Null': 'null'
    }];
    insights.latestCorrData = store.get('currentCorrelationData')
    insights.getCorrelations = function(selection) {
      var profile = store.get('userData');
      return $http({
        method: "POST",
        url: '/user/correlation',
        data: {
          email: profile.email,
          datums: selection
        }
      }).then(function success(resp) {
        return resp.data;
      }, function error(resp) {
        console.log("Error!", resp)
        alert('Sorry, there was an error adding your datums')
      })
    }
    insights.submitSelection = function(selection) {
      insights.metricDisplay = selection.charAt(0).toUpperCase() + selection.slice(1);
      insights.getCorrelations(selection).then(function(dataArr) {
        store.set('currentCorrelationData', dataArr);
        insights.currentCorrelationData = dataArr;
        $rootScope.$broadcast('newData', {
          data: dataArr,
          width: insights.width,
          height: insights.height
        });
        insights.displayData = dataArr;
        insights.displayData = insights.displayData.map(function(obj) {
          var key = Object.keys(obj)[0];
          obj[key] = ~~(obj[key] * 100);
          return obj;
        }).sort(function(a, b) {
          var keyA = Object.keys(a)[0];
          var keyB = Object.keys(b)[0];
          return Math.abs(b[keyB]) - Math.abs(a[keyA]);
        });
      }).catch(function(err) {
        console.log('There was an error getting your correlations', err);
      })
      insights.showSVG = true;
    }
  }
})();
