const User = require('./userModel');

function newUser (email) {
  return User.create({
    email: email
  });
}

function findUser (email) {
  return User.findOne({
    email: email
  });
}

function removeUser (email) {
  return User.remove({
    email: email
  });
}

User.addActivity = function (activity, day) {
  this.getDay(day).activities.push(activity);
  return this.save();
}

User.deleteActivity = function (activity, day) {
  this.getDay(day).activities.splice(
    this.getDay(day).activities.indexOf(activity), 1
  );
  return this.save();
}

User.addMetric = function (metric, day) {
  this.getDay(day).metrics.push(metric);
  return this.save();
}

User.deleteMetric = function (metric, day) {
  this.getDay(day).metrics.splice(
    this.getDay(day).metrics.indexOf(metric), 1
  );
  return this.save();
}

User.saveJournal = function (journal, day) {
  this.getDay(day).journal = journal
  return this.save();
}

User.getCorrelations = function (metric) {
  return {}
}

User.getDay = function (date) {
  for (var x = 0; x < this.days.length; x++) {
    var day = this.days[x];
    if (day.date === date) {
      return day;
    }
  }

  // if day not found, add it and return it
  return {
    date: date,
    // the DO things
    activities: [],
    // the ARE things
    metrics: [],
    // one journal entry per day 
    // sentiment possibly from watson?
    journalEntry: '',
    sentiment: ''
  };
}

module.exports = {
  newUser: newUser,
  findUser: findUser,
  removeUser: removeUser,
  User: User  
}
