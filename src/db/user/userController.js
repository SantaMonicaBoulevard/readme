const User = require('./userModel');
const findCorrelations = require('../../ml/correlations');

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
      } else {
        return user;
      }
    });
}

function removeUser (email) {
  return User.remove({
    email: email
  });
}

User.prototype.addActivity = function (activities, day) {
  var user = this;
  return user.getDay(day)
    .then(function (foundDay) {
      activities.forEach(function (activity) {
        if (user.userActivities.indexOf(activity) === -1) {
          user.userActivities.push(activity);
        }
      });
      foundDay.activities = foundDay.activities.concat(activities);
      return user.save();
    });
};

User.prototype.deleteActivity = function (activity, day) {
  var user = this;
  return user.getDay(day)
    .then(function (foundDay) {
      foundDay.activities.splice(
        foundDay.activities.indexOf(activity), 1
      );
      return user.save();
    });
};

User.prototype.addMetric = function (metrics, day) {
  var user = this;
  return user.getDay(day)
    .then(function (foundDay) {
      metrics.forEach(function (metric) {
        if (user.userMetrics.indexOf(metric) === -1) {
          user.userMetrics.push(metric);
        }
      });
      foundDay.metrics = foundDay.metrics.concat(metrics);
      return user.save();
    });
};

User.prototype.deleteMetric = function (metric, day) {
  var user = this;
  return user.getDay(day)
    .then(function (foundDay) {
      foundDay.metrics.splice(
        foundDay.metrics.indexOf(metric), 1
      );
      return user.save();
    });
};

User.prototype.saveJournal = function (journal, day) {
  var user = this;
  return user.getDay(day)
    .then(function (foundDay) {
      foundDay.journalEntry = journal;
      return user.save();
    });
};

User.prototype.findCorrelations = function (metric) {
  var user = this;
  console.log(user);
  return new Promise(function (resolve) {
    resolve(findCorrelations(user, metric));
  });
};

User.prototype.getDay = function (date) {
  for (var x = 0; x < this.days.length; x++) {
    var day = this.days[x];
    if (day.date === date) {
      return new Promise(function (resolve) {
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
};

module.exports = {
  findOrCreateUser: findOrCreateUser,
  removeUser: removeUser,
  User: User
};
