const User = require('./userModel');
const ml = require('../../ml/correlations');
const http = require('request-promise');
// const wunderground = require('wunderground')('921c08ecbdcbf50c');

function findOrCreateUser(email, firstname, lastname) {
  // use just the email to find them in case this is
  // coming from a place we assume the user has already
  // been created
  return User.findOne({
      email: email
    })
    .then(function(user) {
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

function removeUser(email) {
  return User.remove({
    email: email
  });
}

User.prototype.addActivity = function(activities, day, location) {
  var user = this;

  return user.addPopular('activities', activities)
  .then(function(user){
    return user.getDay(day)

  })
  .then(function(foundDay) {

    if (foundDay.gotWeather === false) {
      var dateForWeather = foundDay.date.split('T')[0].split('-').join('');
      console.log(dateForWeather)

      return user.getWeather(dateForWeather, location, activities, foundDay);

    } else {
      activities.forEach(function(activity) {
        if (user.userActivities.indexOf(activity) === -1) {
          user.userActivities.push(activity);
        }
      });
      foundDay.activities = foundDay.activities.concat(activities);
      return user.save();

    }
  }).then(function(user) {
    return user.save();
  })
  .catch(function(err){
    console.log("Error from addActivity", err)
  })
};



User.prototype.deleteActivity = function(activity, day) {
  var user = this;
  return user.getDay(day)
    .then(function(foundDay) {
      foundDay.activities.splice(
        foundDay.activities.indexOf(activity), 1
      );
      return user.save();
    });
};

User.prototype.addMetric = function(metrics, day) {
  console.log(metrics,'metrics data showing?');
  var user = this;

  user.addPopular('metrics', metrics)
  .then(function(user){

    return user.getDay(day);
  })
  .then(function(foundDay) {
    metrics.forEach(function(metric) {
      if (user.userMetrics.indexOf(metric) === -1) {
        user.userMetrics.push(metric);
      }
    });
    foundDay.metrics = foundDay.metrics.concat(metrics);
    return user.save();
  });
};

User.prototype.deleteMetric = function(metric, day) {
  var user = this;
  return user.getDay(day)
    .then(function(foundDay) {
      foundDay.metrics.splice(
        foundDay.metrics.indexOf(metric), 1
      );
      return user.save();
    });
};

User.prototype.saveJournal = function(journal, day) {
  var user = this;
  return user.getDay(day)
    .then(function(foundDay) {
      foundDay.journalEntry = journal;
      return user.save();
    });
};

User.prototype.findCorrelations = function(metric) {
  var user = this;
  return new Promise(function(resolve) {
    resolve(ml.findCorrelations(user, metric));
  });
};

User.prototype.driftSearch = function(metric, maxDays) {
  var user = this;
  return new Promise(function(resolve) {
    resolve(ml.driftSearch(user, metric, maxDays));
  });
};

User.prototype.getDay = function(date) {
  for (var x = 0; x < this.days.length; x++) {
    var day = this.days[x];
    if (day.date === date) {
      return new Promise(function(resolve) {
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
    .then(function(user) {
      return user.days[user.days.length - 1];
    });
};

User.prototype.addPopular = function(type, datums){
  var user = this;

  datums.forEach(function(datum){
    if (type === 'activities') {
      if (user.popularItems.act[datum] === undefined) {
        user.popularItems.act[datum] = 1;
      } else {
        user.popularItems.act[datum]++;
      }
    } else {
      if (user.popularItems.met[datum] === undefined) {
        user.popularItems.met[datum] = 1;
      } else if (user.popularItems.met[datum] !== undefined) {
        user.popularItems.met[datum]++;
      }
    }
  });
  user.markModified('popularItems');
  return user.save();
};

User.prototype.addSentiment = function (date, sentiment) {
  var user = this;

  return user.getDay(date)
    .then(function (day) {
      day.sentiment = sentiment;
      return user.save();
    });
};

//calls the wunderground API for weather data and pulls pertinent info out of the response
User.prototype.getWeather = function(date, location, activities, foundDay) {
  var user = this;

  var newWeatherParams = [];

  var urlFirst = 'http://api.wunderground.com/api';
  var urlAPIKey = '/921c08ecbdcbf50c';
  var urlDate = '/history_' + date;
  var urlLocation = '/q/' + location.lat + ',' + location.lng + '.json'

  var queryUrl = urlFirst + urlAPIKey + urlDate + urlLocation;

  var options = {
    uri: queryUrl,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  };

  return http(options)
    .then(function(weatherData) {

        var dailySum = weatherData.history.dailysummary[0];
        var dailyCond = weatherData.history.observations;

        if (dailySum.fog === '1') {
          newWeatherParams.push('fog');

        }
        if (dailySum.rain === '1') {
          newWeatherParams.push('rain')
        }
        if (dailySum.snow === '1') {
          newWeatherParams.push('snow')
        }
        if (dailySum.hail === '1') {
          newWeatherParams.push('hail')
        }
        if (dailySum.maxhumidity !== '' && parseInt(dailySum.maxhumidity) > 70) {
          newWeatherParams.push('humid')
        }
        if (parseInt(dailySum.meanwindspdi) > 15) {
          newWeatherParams.push('windy')
        }

        newWeatherParams.push('highs in the ' + dailySum.maxtempi.slice(0, -1) + '0s')

        newWeatherParams.push('lows in the ' + dailySum.mintempi.slice(0, -1) + '0s')

        //Grabs a weather condition halfway through the daily weather observations
        newWeatherParams.push("Conditions: " + dailyCond[Math.floor(dailyCond.length / 2)].conds);

        return newWeatherParams;
    })
    .then(function(newWeatherParams) {
      activities = activities.concat(newWeatherParams);
      activities.forEach(function(activity) {
        if (user.userActivities.indexOf(activity) === -1) {
          user.userActivities.push(activity);
        }
      });

      foundDay.activities = foundDay.activities.concat(activities);
      foundDay.gotWeather = true;
      return user.save();
    });
}

module.exports = {
  findOrCreateUser: findOrCreateUser,
  removeUser: removeUser,
  User: User
};