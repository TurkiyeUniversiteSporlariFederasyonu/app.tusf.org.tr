const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getCurrentSeason = require('../../utils/getCurrentSeason');

const Activity = require('../activity/Activity');
const Student = require('../student/Student');
const University = require('../university/University');

const getRegistration = require('./functions/getRegistration');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 1e3;

const Schema = mongoose.Schema;

const RegistrationSchema = new Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
    // Format: activity_id + university_id
  },
  season: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  activity_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  university_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  student_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  is_canceled: {
    type: Boolean,
    default: false
  },
  gold_medal_count: {
    type: Number,
    default: 0
  },
  silver_medal_count: {
    type: Number,
    default: 0
  },
  bronze_medal_count: {
    type: Number,
    default: 0
  }
});

RegistrationSchema.statics.findRegistrationById = function (id, callback) {
  const Registration = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Registration.findById(mongoose.Types.ObjectId(id.toString()), (err, registration) => {
    if (err) return callback('database_error');
    if (!registration) return callback('document_not_found');

    return callback(null, registration);
  });
};

RegistrationSchema.statics.createRegistration = function (data, callback) {
  const Registration = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.student_id_list || !Array.isArray(data.student_id_list))
    return callback('bad_request');

  Activity.findActivityById(data.activity_id, (err, activity) => {
    if (err) return callback(err);

    University.findUniversityById(data.university_id, (err, university) => {
      if (err) return callback(err);

      async.timesSeries(
        data.student_id_list.length,
        (time, next) => Student.findStudentById(data.student_id_list[time], (err, student) => {
          if (err) return next(err);

          return next(null, student._id);
        }),
        (err, student_id_list) => {
          if (err) return callback(err);

          const newRegistrationData = {
            identifier: activity._id.toString() + university._id.toString(),
            season: getCurrentSeason(),
            activity_id: activity._id,
            university_id: university._id,
            student_id_list
          };

          const newRegistration = new Registration(newRegistrationData);

          newRegistration.save((err, registration) => {
            if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
              return callback('duplicated_unique_field');
            if (err)
              return callback('database_error');

            return callback(null, registration._id.toString());
          });
        }
      );
    });
  });
};

RegistrationSchema.statics.findRegistrationByIdAndFormat = function (id, callback) {
  const Registration = this;

  Registration.findRegistrationById(id, (err, registration) => {
    if (err)
      return callback(err);

    getRegistration(registration, (err, registration) => {
      if (err)
        return callback(err);

      return callback(null, registration);
    });
  });
};

RegistrationSchema.statics.findRegistrationCountFilters = function (data, callback) {
  const Registration = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.season && typeof data.season == 'string')
    filters.season = data.season.trim();

  if (data.activity_id && validator.isMongoId(data.activity_id.toString()))
    filters.activity_id = new mongoose.Types.ObjectId(data.activity_id.toString());

  if (data.university_id && validator.isMongoId(data.university_id.toString()))
    filters.university_id = new mongoose.Types.ObjectId(data.university_id.toString());

  if (data.student_id && validator.isMongoId(data.student_id.toString()))
    filters.student_id_list = new mongoose.Types.ObjectId(data.student_id.toString());

  if ('is_canceled' in data)
    filters.is_canceled = data.is_canceled ? true : false;

  Registration
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(err => callback('database_error'));
};

RegistrationSchema.statics.findRegistrationesByFilters = function (data, callback) {
  const Registration = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_ITEM_COUNT_PER_QUERY ? parseInt(data.limit) : MAX_ITEM_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) ? parseInt(data.page) * limit : 0;

  if (data.season && typeof data.season == 'string')
    filters.season = data.season.trim();

  if (data.activity_id && validator.isMongoId(data.activity_id.toString()))
    filters.activity_id = new mongoose.Types.ObjectId(data.activity_id.toString());

  if (data.university_id && validator.isMongoId(data.university_id.toString()))
    filters.university_id = new mongoose.Types.ObjectId(data.university_id.toString());

  if (data.student_id && validator.isMongoId(data.student_id.toString()))
    filters.student_id_list = new mongoose.Types.ObjectId(data.student_id.toString());

  if ('is_canceled' in data)
    filters.is_canceled = data.is_canceled ? true : false;

  Registration
    .find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 })
    .then(registrationes => async.timesSeries(
      registrationes.length,
      (time, next) => Registration.findRegistrationByIdAndFormat(registrationes[time]._id, (err, registration) => next(err, registration)),
      (err, registrationes) => {
        if (err) return callback(err);

        return callback(null, registrationes);
      }
    ))
    .catch(err =>  callback('database_error'));
};

if (!mongoose.models.Registration)
  mongoose.model('Registration', RegistrationSchema);

module.exports = mongoose.models.Registration;
