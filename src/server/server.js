var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var User = require('../db/user/userController.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/../client')));

app.route('/user')
  // Add a user, or find.
  .post(function (req, res) {
    User.findOrCreateUser(req.body.email, req.body.firstname, req.body.lastname)
      .then(function (user) {
        var adding = JSON.stringify(user);
        res.status(201).send(adding);
      })
      .catch(function (err) {
        console.error(err, 'Error adding user');
        res.status(500).send(err);
      });
  })
  .delete(function (req, res) {
    User.removeUser(req.body.email)
      .then(function (user) {
        var userString = JSON.stringify(user);
        res.send(userString);
      })
      .catch(function (err) {
        console.error(err, 'Error removing user');
        res.status(500).send(err);
      });
  });

// Activity routes.
app.route('/user/activity')
  .post(function (req, res) {
    var activities = req.body.datums;
    var date = req.body.date;
    var location = req.body.location;

    User.findOrCreateUser(req.body.email, req.body.firstname, req.body.lastname)
      .then(function (user) {
        console.log(activities, date, location)
        return user.addActivity(activities, date, location);
      })
      .then(function (user) {
        var userString = JSON.stringify(user);
        res.send(userString);
      })
      .catch(function (err) {
        console.error(err, 'Error finding adding activity');
        res.status(500).send(err);
      });
  })
  .delete(function (req, res) {
    var activity = req.body.datums;
    var date = req.body.date;

    User.findOrCreateUser(req.body.email, req.body.firstname, req.body.lastname)
      .then(function (user) {
        return user.deleteActivity(activity, date);
      })
      .then(function (user) {
        var userString = JSON.stringify(user);
        res.send(userString);
      })
      .catch(function (err) {
        console.error(err, 'Error finding deleting activity');
        res.status(500).send(err);
      });
  });

// Metric Routes.
app.route('/user/metric')
  .post(function (req, res) {
    var metrics = req.body.datums;
    var date = req.body.date;

    User.findOrCreateUser(req.body.email, req.body.firstname, req.body.lastname)
      .then(function (user) {
        return user.addMetric(metrics, date);
      })
      .then(function (user) {
        var userString = JSON.stringify(user);
        res.send(userString);
      })
      .catch(function (err) {
        console.error(err, 'Error adding metric');
        res.status(500).send(err);
      });
  })
  .delete(function (req, res) {
    var metric = req.body.datums;
    var date = req.body.date;

    User.findOrCreateUser(req.body.email, req.body.firstname, req.body.lastname)
      .then(function (user) {
        return user.deleteActivity(metric, date);
      })
      .then(function (user) {
        var userString = JSON.stringify(user);
        res.send(userString);
      })
      .catch(function (err) {
        console.error(err, 'Error deleting metric');
        res.status(500).send(err);
      });
  });

// Save Journal Route.
app.route('/user/journal')
  .post(function (req, res) {
    var entry = req.body.entry;
    var day = req.body.date;

    User.findOrCreateUser(req.body.email, req.body.firstname, req.body.lastname)
      .then(function (user) {
        return user.saveJournal(entry, day);
      })
      .then(function (user) {
        var userString = JSON.stringify(user);
        res.send(userString);
      })
      .catch(function (err) {
        console.error(err, 'Error adding journal entry');
        res.status(500).send(err);
      });
  });

// Find Correlation Route.
// returns an array of activities with correlation calculated, based on the given metric and its occurances corresponding to the activities.
app.route('/user/correlation')
  .post(function (req, res) {
    var metric = req.body.datums;

    User.findOrCreateUser(req.body.email, req.body.firstname, req.body.lastname)
      .then(function (user) {
        return user.findCorrelations(metric);
      })
      .then(function (array) {
        var arrayString = JSON.stringify(array);
        res.send(arrayString);
      })
      .catch(function (err) {
        console.error(err, 'Error finding correlation');
        res.status(500).send(err);
      });
  });

app.route('/user/correlation/driftsearch')
  .post(function (req, res) {
    var metric = req.body.datums;
    var drift = parseInt(req.body.drift);

    User.findOrCreateUser(req.body.email)
      .then(function (user) {
        return user.driftSearch(metric, drift);
      })
      .then(function (results) {
        res.json(results);
      })
      .catch(function (err) {
        console.error(err, 'Error during driftsearch');
        res.status(500).send(err);
      });
  });

var port = process.env.PORT || 3000;
var databaseUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/readme';

mongoose.connect(databaseUrl, function () {
  app.listen(port, function () {
    console.log('Server listening on ' + port);
  });
});
