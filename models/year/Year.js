const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getCurrentSeason = require('../../utils/getCurrentSeason');

const getYear = require('./functions/getYear');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const Schema = mongoose.Schema;

const YearSchema = new Schema({
  season: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  participation_update_start_date: {
    type: Date,
    default: null
  },
  participation_update_end_date: {
    type: Date,
    default: null
  }
});

YearSchema.statics.findYearById = function (id, callback) {
  const Year = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Year.findById(mongoose.Types.ObjectId(id.toString()), (err, year) => {
    if (err) return callback('database_error');
    if (!year) return callback('document_not_found');

    return callback(null, year);
  });
};

YearSchema.statics.findYearByIdAndFormat = function (id, callback) {
  const Year = this;

  Year.findYearById(id, (err, year) => {
    if (err)
      return callback(err);

    getYear(year, (err, year) => {
      if (err)
        return callback(err);

      return callback(null, year);
    });
  });
};

YearSchema.statics.findCurrentYear = function (callback) {
  const Year = this;

  Year.findOne({
    season: getCurrentSeason()
  }, (err, year) => {
    if (err) return callback('database_error');

    if (year)
      return callback(null, year);

    const newYearData = {
      season: getCurrentSeason()
    };

    const newYear = new Year(newYearData);

    newYear.save((err, year) => {
      if (err) return callback('database_error');

      return callback(null, year);
    });
  });
};

if (!mongoose.models.Year)
  mongoose.model('Year', YearSchema);

module.exports = mongoose.models.Year;
