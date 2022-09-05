const University = require('../../university/University');

module.exports = (student, callback) => {
  if (!student || !student._id)
    return callback('document_not_found');

  University.findUniversityById(student.university_id, (err, university) => {
    if (err) return callback(err);

    return callback(null, {
      _id: student._id.toString(),
      id_number: student.id_number,
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
      birth_date: student.birth_date,
      faculty: student.faculty,
      license_number: student.license_number,
      student_number: student.student_number,
      university
    });
  });
}
