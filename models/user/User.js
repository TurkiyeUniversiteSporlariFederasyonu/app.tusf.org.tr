const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const sendEmail = require('../../utils/sendEmail');

const University = require('../university/University');

const formatPhoneNumber = require('./functions/formatPhoneNumber');
const generateRandomHex = require('./functions/generateRandomHex');
const getUser = require('./functions/getUser');
const hashPassword = require('./functions/hashPassword');
const isUserReadyToBeComplete = require('./functions/isUserReadyToBeComplete');
const verifyPassword = require('./functions/verifyPassword');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const ID_NUMBER_LENGTH = 11;
const TEN_MINS_IN_MS = 10 * 60 * 1000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 100;
const MIN_PASSWORD_LENGTH = 8;
const SECURE_STRING_LENGTH = 32;

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  name: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  password: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  university_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  password_update_verification_token: {
    type: String,
    default: null,
    length: SECURE_STRING_LENGTH
  },
  password_update_last_verification_time_in_unix: {
    type: Number,
    default: null
  },
  phone_number: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  title: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  id_number: {
    type: String,
    trim: true,
    sparse: true,
    length: ID_NUMBER_LENGTH,
    default: null
  }
});

UserSchema.pre('save', hashPassword);

UserSchema.statics.findUserById = function (id, callback) {
  const User = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findById(mongoose.Types.ObjectId(id.toString()), (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    return callback(null, user);
  });
};

UserSchema.statics.findUserByEmailAndVerifyPassword = function (data, callback) {
  const User = this;

  if (!data || !data.email || !validator.isEmail(data.email) || !data.password)
    return callback('bad_request');

  User.findOne({
    email: data.email.trim()
  }, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    if (user.is_deleted)
      return callback('not_authenticated_request');

    verifyPassword(data.password.trim(), user.password, res => {
      if (!res) return callback('password_verification');

      return callback(null, user);
    });
  });
};

UserSchema.statics.findUserByIdAndFormat = function (id, callback) {
  const User = this;

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    isUserReadyToBeComplete(user, (err, res) => {
      if (err) return callback(err);

      if (res == user.is_completed) {
        getUser(user, (err, user) => {
          if (err) return callback(err);
    
          return callback(null, user);
        });
      } else {
        User.findByIdAndUpdate(user._id, {$set: {
          is_completed: res
        }}, { new: true }, (err, user) => {
          if (err) return callback('database_error');
  
          getUser(user, (err, user) => {
            if (err) return callback(err);
      
            return callback(null, user);
          });
        });
      }
    });
  });
};

UserSchema.statics.findUserByEmailAndGeneratePasswordVerificationToken = function (email, callback) {
  const User = this;

  if (!email || !validator.isEmail(email.toString()))
    return callback('bad_request');

  User.findOne({
    email: email.toString().trim()
  }, (err, user) => {
    if (err)
      return callback('bad_request');
    if (!user)
      return callback('document_not_found')

    User.findByIdAndUpdate(user._id, {$set: {
      password_update_verification_token: generateRandomHex(SECURE_STRING_LENGTH),
      password_update_last_verification_time_in_unix: parseInt((new Date()).getTime()) + TEN_MINS_IN_MS
    }}, { new: true }, (err, user) => {
      if (err)
        return callback('database_error');

      sendEmail({
        template: 'user_password_reset',
        to: user.email,
        _id: user._id.toString(),
        email: user.email,
        name: user.name && user.name.length ? user.name : user.email.split('@')[0],
        token: user.password_update_verification_token
      }, err => {
        if (err)
          return callback(err);

        return callback(null);
      });
    });
  });
};

UserSchema.statics.findUserByIdAndPasswordVerificationTokenAndUpdatePassword = function (data, callback) {
  const User = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.password || typeof data.password != 'string' || data.password.trim().length < MIN_PASSWORD_LENGTH)
    return callback('bad_request');

  User.findUserById(data._id, (err, user) => {
    if (err) return callback(err);

    if (user.password_update_last_verification_time_in_unix < parseInt((new Date()).getTime()))
      return callback('request_timeout');

    if (!data.password_update_verification_token || data.password_update_verification_token.toString() != user.password_update_verification_token)
      return callback('not_authenticated_request');

    user.password = data.password.trim();

    user.save(err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

UserSchema.statics.findUserByIdAndUpdate = function (id, data, callback) {
  const User = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    User.findByIdAndUpdate(user._id, {$set: {
      name: data.name && typeof data.name == 'string' && data.name.trim().length ? data.name.trim() : user.name,
      phone_number: formatPhoneNumber(data.phone_number) ? formatPhoneNumber(data.phone_number) : user.phone_number,
      title: data.title && typeof data.title == 'string' && data.title.trim().length ? data.title.trim() : user.title,
      id_number: data.id_number && typeof data.id_number == 'string' && data.id_number.trim().length == ID_NUMBER_LENGTH ? data.id_number.trim() : user.id_number,
    }}, { new: true }, (err, user) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      isUserReadyToBeComplete(user, (err, res) => {
        if (err) return callback(err);

        if (res == user.is_completed)
          return callback(null);

        User.findByIdAndUpdate(user._id, {$set: {
          is_completed: res
        }}, err => {
          if (err) return callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

UserSchema.statics.findUserByIdAndUpdatePassword = function (id, data, callback) {
  const User = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.new_password || typeof data.new_password != 'string' || data.new_password.trim().length < MIN_PASSWORD_LENGTH)
    return callback('bad_request');

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    User.findUserByEmailAndVerifyPassword({
      email: user.email,
      password: data.old_password
    }, (err, user) => {
      if (err) return callback(err);

      user.password = data.new_password.trim();

      user.save(err => {
        if (err) return callback('database_error');

        return callback(null);
      });
    });
  });
};

UserSchema.statics.findUserByIdAndUpdateUniversity = function (id, data, callback) {
  const User = this;

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    University.findUniversityByIdAndUpdate(user.university_id, data, err => {
      if (err) return callback(err);

      return callback(null);
    });
  });
};

module.exports = mongoose.model('User', UserSchema);
