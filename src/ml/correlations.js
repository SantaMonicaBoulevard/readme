/**
 * todo:
 *  - invert sparse data to find correlations with things NOT happening
 *  - somehow find a way to be sensitive to time delays, perhaps? not sure
 *  - generate 'feature pairs' - maybe correlate only with things happening together
 *  - be sensitive to how many times an activity is done (same day? each week?)
 */

function findCorrelations (user, target) {
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
  // this is the 'correlation table'
  var yy,  // both target and activity present
      nn,  // neither target nor activity present
      yn,  // target present, but not activity
      ny,  // target not present, but activity present
      ya,  // target present
      na,  // target not present
      ay,  // activity present
      an;  // activity not present

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
  
  // get phi formula numerator and denominator 
  // given above variables
  var phiN = (yy * nn) - (yn * ny);
  var phiD = ya * na * ay * an;
  return phiD !== 0 ? phiN / phiD : 0;
}

function count (user, activity, target, da, dt) {
  // generates a sum of the instances that meet the
  // given yes/no/any criteria
  return user.days.reduce(function (memo, day) {
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