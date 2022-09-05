const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Activity = require('../activity/Activity');

const getContest = require('./functions/getContest');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 1e3;

const Schema = mongoose.Schema;

const ContestSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  activity_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  }
});

ContestSchema.statics.findContestById = function (id, callback) {
  const Contest = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Contest.findById(mongoose.Types.ObjectId(id.toString()), (err, contest) => {
    if (err) return callback('database_error');
    if (!contest) return callback('document_not_found');

    return callback(null, contest);
  });
};

ContestSchema.statics.createContest = function (data, callback) {
  const Contest = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!isNaN(new Date(data.start_date.toString())))
    return callback('bad_request');

  if (!isNaN(new Date(data.end_date.toString())))
    return callback('bad_request');

  if (!data.activity_id_list || !Array.isArray(data.activity_id_list) || data.activity_id_list.length > MAX_DATABASE_ARRAY_FIELD_LENGTH)
    return callback('bad_request');

  async.timesSeries(
    data.activity_id_list.length,
    (time, next) => Activity.findActivityById(activity_id_list[time], (err, activity) => {
      if (err) return next(err);

      return next(null, activity._id);
    }),
    (err, activity_id_list) => {
      if (err) return callback(err);

      const newContestData = {
        name: data.name,
        start_date: new Date(data.start_date.toString()),
        end_date: new Date(data.end_date.toString()),
        activity_id_list
      };

      const newContest = new Contest(newContestData);

      newContest.save((err, contest) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err)
          return callback('database_error');

        return callback(null, contest._id.toString());
      });
    }
  );
};

ContestSchema.statics.findContestByIdAndFormat = function (id, callback) {
  const Contest = this;

  Contest.findContestById(id, (err, contest) => {
    if (err)
      return callback(err);

    getContest(contest, (err, contest) => {
      if (err)
        return callback(err);

      return callback(null, contest);
    });
  });
};

ContestSchema.statics.findContestCountFilters = function (data, callback) {
  const Contest = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.is_deleted)
    filters.is_deleted = true;
  else
    filters.is_deleted = { $ne: true };

  if (data.name && typeof data.name == 'string')
    filters.name = data.name.trim();

  Contest
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(err => callback('database_error'));
};

ContestSchema.statics.findContestsByFilters = function (data, callback) {
  const Contest = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_ITEM_COUNT_PER_QUERY ? parseInt(data.limit) : MAX_ITEM_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) ? parseInt(data.page) * limit : 0;

  if (data.is_deleted)
    filters.is_deleted = true;
  else
    filters.is_deleted = { $ne: true };

  if (data.name && typeof data.name == 'string')
    filters.name = data.name.trim();

  Contest
    .find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 })
    .then(contests => async.timesSeries(
      contests.length,
      (time, next) => Contest.findContestByIdAndFormat(contests[time]._id, (err, contest) => next(err, contest)),
      (err, contests) => {
        if (err) return callback(err);

        return callback(null, contests);
      }
    ))
    .catch(err =>  callback('database_error'));
};

ContestSchema.statics.findContestByIdAndUpdate = function (id, data, callback) {
  const Contest = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.activity_id_list || !Array.isArray(data.activity_id_list) || data.activity_id_list > MAX_DATABASE_ARRAY_FIELD_LENGTH)
    return callback('bad_request');

  Contest.findContestById(id, (err, contest) => {
    if (err) return callback(err);

    async.timesSeries(
      data.activity_id_list.length,
      (time, next) => Activity.findActivityById(activity_id_list[time], (err, activity) => {
        if (err) return next(err);
  
        return next(null, activity._id);
      }),
      (err, activity_id_list) => {
        if (err) return callback(err);

        Contest.findByIdAndUpdate(contest._id, {$set: {
          name: data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name.trim() : contest.name,
          start_date: !isNaN(new Date(data.start_date.toString())) ? new Date(data.start_date.toString()) : contest.start_date,
          end_date: !isNaN(new Date(data.end_date.toString())) ? new Date(data.end_date.toString()) : contest.end_date,
          activity_id_list
        }}, err => {
          if (err) return callback('database_error');

          return callback(null);
        });
      }
    );
  });
};

ContestSchema.statics.findContestByIdAndDelete = function (id, callback) {
  const Contest = this;

  Contest.findContestById(id, (err, contest) => {
    if (err) return callback(err);

    if (contest.is_deleted)
      return callback(null);

    Contest.findByIdAndUpdate(contest._id, {$set: {
      name: contest.name + '_' + contest._id.toString(),
      is_deleted: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

ContestSchema.statics.findContestByIdAndRestore = function (id, callback) {
  const Contest = this;

  Contest.findContestById(id, (err, contest) => {
    if (err) return callback(err);

    if (!contest.is_deleted)
      return callback(null);

    Contest.findByIdAndUpdate(contest._id, {$set: {
      name: contest.name.replace('_' + contest._id.toString(), ''),
      is_deleted: false
    }}, err => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err)
        return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('Contest', ContestSchema);
