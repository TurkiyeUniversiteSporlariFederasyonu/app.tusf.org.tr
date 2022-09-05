const University = require('../../university/University');

module.exports = (user, callback) => {
  if (!user || !user._id)
    return callback('bad_request');

  University.findUniversityByIdAndFormat(user.university_id, (err, university) => {
    if (err) return callback(err);

    return callback(null, {
      _id: user._id.toString(),
      email: user.email.replace('_' + user._id.toString(), ''),
      name: user.name,
      phone_number: user.phone_number,
      title: user.title,
      id_number: user.id_number,
      is_deleted: user.is_deleted,
      is_completed: user.is_completed,
      university
    });
  });
}
