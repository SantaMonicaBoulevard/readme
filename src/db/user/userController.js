const User = require('./userModel');
const findCorrelations = require('../../ml/correlations').findCorrelations;

function findOrCreateUser (email, firstname, lastname) {
  // use just the email to find them in case this is
  // coming from a place we assume the user has already
  // been created
  return User.findOne({
    email: email
  })
    .then(function (user) {
      if (!user) {
        return User.create({
          email: email,
          firstname: firstname,
          lastname: lastname
        });
      }

      else {
        return user;
      }
    });
}

function removeUser (email) {
  return User.remove({
    email: email
  });
}

User.prototype.addActivity = function (activity, day) {
  var user = this;
  return user.getDay(day)
    .then(function (day) {
      day.activities.push(activity);
      return user.save();
    });
}

User.prototype.deleteActivity = function (activity, day) {
  var user = this;
  return user.getDay(day)
    .then(function (day) {
      day.activities.splice(
        day.activities.indexOf(activity), 1
      );
      return user.save();
    });
}

User.prototype.addMetric = function (metric, day) {
  var user = this;
  return user.getDay(day)
    .then(function (day) {
      day.metrics.push(metric);
      return user.save();
    });
}

User.prototype.deleteMetric = function (metric, day) {
  var user = this;
  return user.getDay(day)
    .then(function (day) {
      day.metrics.splice(
        day.metrics.indexOf(metric), 1
      );
      return user.save();
    });
}

User.prototype.saveJournal = function (journal, day) {
  var user = this;
  return user.getDay(day)
    .then(function (day) {
      day.journalEntry = journal;
      return user.save();
    });
}

User.prototype.findCorrelations = function (metric) {
  var user = this;
  return new Promise(function (resolve, reject) {
    resolve(findCorrelations(user, metric));
  });
}

User.prototype.getDay = function (date) {
  for (var x = 0; x < this.days.length; x++) {
    var day = this.days[x];
    if (day.date === typeof date === 'object' ? date.toString() : date) {
      return new Promise(function (resolve, reject) {
        resolve(day);
      });
    }
  }

  // if day not found, add it and return it
  this.days.push({
    date: date.toString(),
    activities: [],
    metrics: [],
    journalEntry: '',
    sentiment: ''
  });
  return this.save()
    .then(function (user) {
      return user.days[user.days.length - 1];
    });
}

module.exports = {
  findOrCreateUser: findOrCreateUser,
  removeUser: removeUser,
  User: User
}
