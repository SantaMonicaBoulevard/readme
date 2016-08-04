var assert = require('chai').assert;
var mongoose = require('mongoose');
var userController = require('../src/db/user/userController');
var User = userController.User;

describe('userController', function () {
  var testEmail = '1@asdfccc.com';
  var testDate = new Date(2016, 6, 6);
  var databaseUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/readme';

  before(function () {
    // ensures the db is connected before tests run
    return mongoose.connect(databaseUrl);
  });

  after(function () {
    // clean up test data after all tests run
    return userController.removeUser(testEmail);
  });

  describe('newUser', function () {
    it('should create a new user', function () {
      return userController.newUser(testEmail)
        .then(function (user) {
          assert.instanceOf(user, User);
        });
    });
  });

  describe('findUser', function () {
    it('should find a user', function () {
      return userController.findUser(testEmail)
        .then(function (user) {
          assert.instanceOf(user, User);
        });
    });
  });

  describe('addActivity', function () {
    it('should add an activity', function () {
      userController.findUser(testEmail)
        .then(function (user) {
          return user.addActivity('bowling', testDate);
        })
        .then(function (user) {
          var day = user.getDay(testDate);
          assert.include(day.activities, 'bowling');
        });
    });
  });

  describe('deleteActivity', function () {
    it('should delete an activity', function () {
      userController.findUser(testEmail)
        .then(function (user) {
          return user.deleteActivity('bowling', testDate);
        })
        .then(function (user) {
          var day = user.getDay(testDate);
          assert.notInclude(day.activities, 'bowling');
        });
    });
  });

  describe('addMetric', function () {
    it('should add a metric', function () {
      userController.findUser(testEmail)
        .then(function (user) {
          return user.addMetric('headache', testDate);
        })
        .then(function (user) {
          var day = user.getDay(testDate);
          assert.include(day.metrics, 'headache');
        });
    });
  });

  describe('deleteMetric', function () {
    it('should delete a metric', function () {
      userController.findUser(testEmail)
        .then(function (user) {
          return user.deleteMetric('headache', testDate);
        })
        .then(function (user) {
          var day = user.getDay(testDate);
          assert.notInclude(day.metrics, 'headache');
        });
      });
  });

  describe('saveJournal', function () {
    it('should save the journal', function () {
      userController.findUser(testEmail)
        .then(function (user) {
          return user.saveJournal('test journal', testDate)
        })
        .then(function (user) {
          var journal = user.getDay(testDate).journal
          assert.equal('test journal', journal);
        });
    });
  });
});
