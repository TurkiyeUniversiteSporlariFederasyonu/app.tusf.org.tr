const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const University = require('../university/University');

const checkIdentityInformation = require('./functions/checkIdentityInformation');
const getStudent = require('./functions/getStudent');

const gender_values = ['male', 'female'];

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const ID_NUMBER_LENGTH = 11;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 100;

const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  university_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  id_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: ID_NUMBER_LENGTH
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  gender: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  birth_date: {
    type: Date,
    required: true
  },
  faculty: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  license_number: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  student_number: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
});

StudentSchema.statics.findStudentById = function (university_id, id, callback) {
  const Student = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  University.findUniversityById(university_id, (err, university) => {
    if (err) return callback(err);

    Student.findById(mongoose.Types.ObjectId(id.toString()), (err, student) => {
      if (err) return callback('database_error');
      if (!student) return callback('document_not_found');
      if (student.university_id.toString() != university._id.toString())
        return callback('not_authenticated_request');
  
      return callback(null, student);
    });
  })

  
};

StudentSchema.statics.createStudent = function (data, callback) {
  const Student = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.id_number || typeof data.id_number != 'string' || data.id_number.length != ID_NUMBER_LENGTH)
    return callback('bad_request');

  if (!data.first_name || typeof data.first_name != 'string' || !data.first_name.trim().length || data.first_name.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.last_name || typeof data.last_name != 'string' || !data.last_name.trim().length || data.last_name.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.gender || !gender_values.includes(data.gender))
    return callback('bad_request');

  if (!data.birth_date || isNaN(new Date(data.birth_date.toString())))
    return callback('bad_request');

  if (!data.faculty || typeof data.faculty != 'string' || !data.faculty.trim().length || data.faculty.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.license_number || typeof data.license_number != 'string' || !data.license_number.trim().length || data.license_number.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.student_number || typeof data.student_number != 'string' || !data.student_number.trim().length || data.student_number.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  University.findUniversityById(data.university_id, (err, university) => {
    if (err) return callback(err);

    checkIdentityInformation(data, (err, data) => {
      if (err) return callback(err);
  
      const newStudentData = {
        university_id: university._id,
        id_number: data.id_number,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        birth_date: new Date(data.birth_date),
        faculty: data.faculty,
        license_number: data.license_number,
        student_number: data.student_number,
      };
    
      const newStudent = new Student(newStudentData);
    
      newStudent.save((err, student) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err)
          return callback('database_error');
    
        return callback(null, student._id.toString());
      });
    });
  });
};

StudentSchema.statics.findStudentByIdAndFormat = function (university_id, id, callback) {
  const Student = this;

  Student.findStudentById(university_id, id, (err, student) => {
    if (err)
      return callback(err);

    getStudent(student, (err, student) => {
      if (err)
        return callback(err);

      return callback(null, student);
    });
  });
};

StudentSchema.statics.findStudentCountByFilters = function (university_id, data, callback) {
  const Student = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  University.findUniversityById(university_id, (err, university) => {
    if (err) return callback(err);

    const filters = {
      university_id: university._id
    };
  
    if (data.identity_number && typeof data.identity_number == 'string')
      filters.identity_number = data.identity_number.trim();
  
    if (data.first_name && typeof data.first_name == 'string')
      filters.first_name = data.first_name.trim();
  
    if (data.last_name && typeof data.last_name == 'string')
      filters.last_name = data.last_name.trim();
  
    if (data.gender && gender_values.includes(data.gender))
      filters.gender = data.gender;
  
    if (data.faculty && typeof data.faculty == 'string')
      filters.faculty = data.faculty.trim();
  
    if (data.license_number && typeof data.license_number == 'string')
      filters.license_number = data.license_number.trim();
  
    if (data.student_number && typeof data.student_number == 'string')
      filters.student_number = data.student_number.trim();
  
    Student
      .find(filters)
      .countDocuments()
      .then(number => callback(null, number))
      .catch(err => callback('database_error'));
  });
};

StudentSchema.statics.findStudentsByFilters = function (university_id, data, callback) {
  const Student = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  University.findUniversityById(university_id, (err, university) => {
    if (err) return callback(err);

    const filters = {
      university_id: university._id
    };
    const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_ITEM_COUNT_PER_QUERY ? parseInt(data.limit) : MAX_ITEM_COUNT_PER_QUERY;
    const skip = data.page && !isNaN(parseInt(data.page)) ? parseInt(data.page) * limit : 0;
  
    if (data._id && validator.isMongoId(data._id.toString()))
      filters._id = new mongoose.Types.ObjectId(data._id.toString());
  
    if (data.university_id && validator.isMongoId(data.university_id.toString()))
      filters.university_id = new mongoose.Types.ObjectId(data.university_id.toString());
  
    if (data.identity_number && typeof data.identity_number == 'string')
      filters.identity_number = data.identity_number.trim();
  
    if (data.first_name && typeof data.first_name == 'string')
      filters.first_name = data.first_name.trim();
  
    if (data.last_name && typeof data.last_name == 'string')
      filters.last_name = data.last_name.trim();
  
    if (data.gender && gender_values.includes(data.gender))
      filters.gender = data.gender;
  
    if (data.faculty && typeof data.faculty == 'string')
      filters.faculty = data.faculty.trim();
  
    if (data.license_number && typeof data.license_number == 'string')
      filters.license_number = data.license_number.trim();
  
    if (data.student_number && typeof data.student_number == 'string')
      filters.student_number = data.student_number.trim();
  
    Student
      .find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .then(students => async.timesSeries(
        students.length,
        (time, next) => Student.findStudentByIdAndFormat(students[time]._id, (err, student) => next(err, student)),
        (err, students) => {
          if (err) return callback(err);
  
          return callback(null, students);
        }
      ))
      .catch(err =>  callback('database_error'));
  });
};

StudentSchema.statics.findStudentByIdAndUpdate = function (university_id, id, data, callback) {
  const Student = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Student.findStudentById(university_id, id, (err, student) => {
    if (err) return callback(err);

    Student.findByIdAndUpdate(student._id, {$set: {
      faculty: data.faculty && typeof data.faculty == 'string' && data.faculty.trim().length && data.faculty.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.faculty.trim() : student.faculty,
      license_number: data.license_number && typeof data.license_number == 'string' && data.license_number.trim().length && data.license_number.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.license_number.trim() : student.license_number,
      student_number: data.student_number && typeof data.student_number == 'string' && data.student_number.trim().length && data.student_number.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.student_number.trim() : student.student_number
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);   
    });
  });
};

StudentSchema.statics.findStudentByIdAndDelete = function (university_id, id, data, callback) {
  const Student = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Student.findStudentById(university_id, id, (err, student) => {
    if (err) return callback(err);

    if (student.is_deleted)
      return callback(null);

    Student.findByIdAndUpdate(student._id, {$set: {
      id_number: student.id_number + '_' + student._id,
      is_deleted: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);   
    });
  });
};

StudentSchema.statics.findStudentByIdAndRestore = function (university_id, id, data, callback) {
  const Student = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Student.findStudentById(university_id, id, (err, student) => {
    if (err) return callback(err);

    if (!student.is_deleted)
      return callback(null);

    Student.findByIdAndUpdate(student._id, {$set: {
      id_number: student.id_number.replace('_' + student._id, ''),
      is_deleted: false
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);   
    });
  });
};

if (!mongoose.models.Student)
  mongoose.model('Student', StudentSchema);

module.exports = mongoose.models.Student;
