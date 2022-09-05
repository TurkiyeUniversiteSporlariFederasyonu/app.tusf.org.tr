const async = require('async');

const Activity = require('../../activity/Activity');

module.exports = (contest, callback) => {
  if (!contest || !contest._id)
    return callback('document_not_found');

  async.timesSeries(
    contest.activity_id_list.length,
    (time, next) => Activity.findActivityByIdAndFormat(contest.activity_id_list[time], (err, activity) => next(err, activity)),
    (err, activities) => {
      if (err) return callback(err);

      return callback(null, {
        _id: contest._id.toString(),
        name: contest.name.replace('_' + activity._id.toString(), ''),
        start_date: contest.start_date,
        end_date: contest.end_date,
        activities
      });
    }
  );
}
