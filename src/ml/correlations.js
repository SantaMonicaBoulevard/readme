/**
 * todo:
 *  - invert sparse data to find correlations with things NOT happening
 *  - somehow find a way to be sensitive to time delays, perhaps? not sure
 *  - generate 'feature pairs' - maybe correlate only with things happening together
 */

function findCorrelations (user, target) {
  console.log(user);
  // calculates the phi of every possible activity + target
  var activities = gatherActivities(user);
  return activities.map(function (activity) {
    return {
      [activity]: findCorrelation(user, activity, target)
    };
  });
}

function gatherActivities (user) {
  // gather a list of ALL activities to iterate through
  return Array.from(user.days.reduce(function (memo, day) {
    day.activities.forEach(function (activity) {
      memo.add(activity);
    });
    return memo;
  }, new Set()));
}

function findCorrelation (user, activity, target) {
  console.log(activity, target);
  // this is the 'correlation table'
  var yy;  // both target and activity present
  var nn;  // neither target nor activity present
  var yn;  // target present, but not activity
  var ny;  // target not present, but activity present
  var ya;  // target present
  var na;  // target not present
  var ay;  // activity present
  var an;  // activity not present

  // count() looks at all instances to gather counts
  // given the conditions specified by the variable
  // 1 = yes, -1 = no, 0 = any
  yy = count(user, activity, target, 1, 1);
  nn = count(user, activity, target, -1, -1);
  yn = count(user, activity, target, 1, -1);
  ny = count(user, activity, target, -1, 1);
  ya = count(user, activity, target, 1, 0);
  na = count(user, activity, target, -1, 0);
  ay = count(user, activity, target, 0, 1);
  an = count(user, activity, target, 0, -1);

  console.log(yy, nn, yn, ny, ya, na, ay, an);

  // get phi formula numerator and denominator
  // given above variables
  var phiN = (yy * nn) - (yn * ny);
  var phiD = Math.sqrt(ya * na * ay * an);
  return phiD !== 0 ? phiN / phiD : 0;
}

function count (user, activity, target, da, dt) {
  // generates a sum of the instances that meet the
  // given yes/no/any criteria
  return user.days.reduce(function (memo, day) {
    console.log(day);
    console.log(day.activities);
    console.log(day.metrics);
    if (da === 1) {
      // the activity must be present
      if (day.activities.indexOf(activity) === -1) {
        return memo;
      }
    }

    if (dt === 1) {
      // the target must be present
      if (day.metrics.indexOf(target) === -1) {
        return memo;
      }
    }

    if (da === -1) {
      // the activity must NOT be present
      if (day.activities.indexOf(activity) !== -1) {
        return memo;
      }
    }

    if (dt === -1) {
      // the target must NOT be present
      if (day.metrics.indexOf(target) !== -1) {
        return memo;
      }
    }

    // if all of the above fall through, this is a valid
    // instance, increment the counter and move on
    return memo + 1;
  }, 0);
}

module.exports = findCorrelations;
