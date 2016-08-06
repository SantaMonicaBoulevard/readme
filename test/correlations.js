var findCorrelations = require('../src/ml/correlations').findCorrelations;
var driftSearch = require('../src/ml/correlations').driftSearch;
var assert = require('chai').assert;

var testUser = {
  days: [
    {
      activities: ['run', 'eat', 'sleep', 'dance'],
      metrics: ['headache', 'sad']
    },
    {
      activities: ['eat', 'sleep', 'dance'],
      metrics: ['happy']
    },
    {
      activities: ['run', 'eat', 'sleep', 'movie'],
      metrics: ['headache']
    },
    {
      activities: ['run', 'eat', 'sleep', 'dance'],
      metrics: ['headache', 'sad']
    },
    {
      activities: ['eat', 'sleep', 'dance', 'sing'],
      metrics: ['happy']
    }
  ]
};

describe('correlations', function () {
  it('should find correlations', function () {
    var headache = findCorrelations(testUser, 'headache');
    var happy = findCorrelations(testUser, 'happy');

    assert.isAbove(headache.filter(function (cor) {
      return 'run' in cor;
    })[0].run, .1);

    assert.isAbove(happy.filter(function (cor) {
      return 'sing' in cor;
    })[0].sing, .1);
  });

  describe('drift', function () {
    it('should drift like tokyo', function () {
      assert.isArray(driftSearch(user, 'headache', 2));
    });
  });
});
