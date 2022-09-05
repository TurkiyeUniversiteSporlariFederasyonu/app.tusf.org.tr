const async = require('async');

const Activity = require('../../activity/Activity');
const Student = require('../../student/Student');
const University = require('../../university/University');

module.exports = (registration, callback) => {
  if (!registration || typeof registration != 'object')
    return callback('document_not_found');

  Activity.findActivityById(registration.activity_id, (err, activity) => {
    if (err) return callback(err);

    University.findUniversityById(registration.university_id, (err, university) => {
      if (err) return callback(err);

      async.timesSeries(
        registration.student_id_list.length,
        (time, next) => Student.findStudentByIdAndFormat(registration.student_id_list[time], (err, student) => next(err, student)),
        (err, students) => {
          if (err) return callback(err);

          return callback(null, {
            _id: registration._id.toString(),
            identifier: registration.identifier,
            activity,
            university,
            students,
            is_canceled: registration.is_canceled,
            gold_medal_count: registration.gold_medal_count,
            silver_medal_count: registration.silver_medal_count,
            bronze_medal_count: registration.bronze_medal_count
          });
        }
      );
    });
  });
}
