var assert = require('chai').assert;
var mongoose = require('mongoose');
var userController = require('../src/db/user/userController');
var User = userController.User;
var request = require('supertest')('http://localhost:3000');
var app = require('../src/server/server.js');
var expect = require('chai').expect;


// Return a JSON object back from the response
// Handles both `res.send(JSON.stringify({}))` and `res.json({})`
var getBody = function (res) {
  return JSON.parse(res.text);
};

describe('RESTful API', function () {
  var testEmail = 'shmoe@test.com';
  var firstname = 'shmoe';
  var lastname = 'cool';
  var newUser = {
        firstname: firstname,
        lastname: lastname,
        email: testEmail
  };

  var testDate = new Date(2016, 6, 6);
  var databaseUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/readme';

  before(function () {
    // ensures the db is connected before tests run
    return mongoose.createConnection(databaseUrl);
  });

  after(function () {
    // clean up test data after all tests run
    return userController.removeUser(newUser.email);
  });

  //User tests.
  describe('POST', function () {

    it('responds with a 201 (Created) when a valid user is sent', function (done) {

      request
        .post('/user')
        .send(newUser)
        .expect(201, done);

    });

  });

  describe('DELETE',  function() {

    it('responds with a 200 when finding deleting a user from an email address', function(done) {

      request
        .delete('/user')
        .set('Accept', "application/x-www-form-urlencoded")
        .send({email: 'shmoe@test.com'})
        .expect(200, done);
    });
  });

  // Activities tests
  describe('POST',  function() {

    it('responds with a 200 when adding an activity', function(done) {

      newUser.activity = 'ran';
      newUser.day = testDate


      request
        .post('/user/activity')
        .set('Accept', "application/x-www-form-urlencoded")
        .send(newUser)
        .expect(200)
        .end(function(err, data) {
          var parsedData = JSON.parse(data.text);
          expect(parsedData.days[0].activities[0]).to.equal("ran");
          done();
        });
    });
  });

  describe('DELETE',  function() {

    it('responds with a 200 when deleting an activity', function(done) {

      newUser.activity = "ran";
      newUser.day = testDate


      request
        .delete('/user/activity')
        .set('Accept', "application/x-www-form-urlencoded")
        .send(newUser)
        .expect(200, done);
    });
  });


// Metrics tests
  describe('POST',  function() {

    it('responds with a 200 when adding a metric', function(done) {

      newUser.metric = 'headache';
      newUser.day = testDate;


      request
        .post('/user/metric')
        .set('Accept', "application/x-www-form-urlencoded")
        .send(newUser)
        .expect(200)
        .end(function(err, data) {
          var parsedData = JSON.parse(data.text);
          expect(parsedData.days[0].metrics[0]).to.equal("headache");
          done();
        });
    });
  });

  describe('DELETE',  function() {

    it('responds with a 200 when deleting a metric', function(done) {

      newUser.metric = 'headache';
      newUser.day = testDate;

      request
        .delete('/user/metric')
        .set('Accept', "application/x-www-form-urlencoded")
        .send(newUser)
        .expect(200, done);
    });
  });










});
















