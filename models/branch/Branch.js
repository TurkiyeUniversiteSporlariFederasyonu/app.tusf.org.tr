const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getBranch = require('./functions/getBranch');

const type_values = ['individual', 'team'];
const gender_values = ['male', 'female', 'mix'];

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 1e3;

const Schema = mongoose.Schema;

const BranchSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  type: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  gender: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: gender_values.length
  },
  subbranches: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  categories: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  gold_count: {
    type: Number,
    default: 1,
    min: 0
  },
  silver_count: {
    type: Number,
    default: 1,
    min: 0
  },
  bronze_count: {
    type: Number,
    default: 1,
    min: 0
  },
  team_min_size: {
    type: Number,
    default: null
  },
  team_max_size: {
    type: Number,
    default: null
  }
});

BranchSchema.statics.findBranchById = function (id, callback) {
  const Branch = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Branch.findById(mongoose.Types.ObjectId(id.toString()), (err, branch) => {
    if (err) return callback('database_error');
    if (!branch) return callback('document_not_found');

    return callback(null, branch);
  });
};

BranchSchema.statics.createBranch = function (data, callback) {
  const Branch = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.type || !type_values.includes(data.type.toString()))
    return callback('bad_request');

  if (!data.subbranches || !Array.isArray(data.subbranches) || data.subbranches.length > MAX_DATABASE_ARRAY_FIELD_LENGTH)
    data.subbranches = [];
  else
    data.subbranches = data.subbranches.filter(each => typeof each == 'string' && each.trim().length && each.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH);
  
  if (!data.categories || !Array.isArray(data.categories) || data.categories.length > MAX_DATABASE_ARRAY_FIELD_LENGTH)
    data.categories = [];
  else
    data.categories = data.categories.filter(each => typeof each == 'string' && each.trim().length && each.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH);
  
  if (!data.gender || !gender_values.includes(data.gender.toString()))
    return callback('bad_request');

  if (!data.gold_count || isNaN(parseInt(data.gold_count)) || parseInt(data.gold_count) < 0)
    return callback('bad_request');
  else
    data.gold_count = parseInt(data.gold_count);

  if (!data.silver_count || isNaN(parseInt(data.silver_count)) || parseInt(data.silver_count) < 0)
    return callback('bad_request');
  else
    data.silver_count = parseInt(data.silver_count);

  if (!data.bronze_count || isNaN(parseInt(data.bronze_count)) || parseInt(data.bronze_count) < 0)
    return callback('bad_request');
  else
    data.bronze_count = parseInt(data.bronze_count);

  if (data.type == 'individual' || !data.team_min_size || isNaN(parseInt(data.team_min_size)) || parseInt(data.team_min_size) < 1)
    data.team_min_size = null;
  else
    data.team_min_size = parseInt(data.team_min_size);

  if (data.type == 'individual' || !data.team_max_size || isNaN(parseInt(data.team_max_size)) || parseInt(data.team_max_size) < 1)
    data.team_max_size = null;
  else
    data.team_max_size = parseInt(data.team_max_size);

  if (data.team_min_size && data.team_max_size && data.team_min_size < data.team_max_size)
    return callback('bad_request');

  const newBranchData = {
    name: data.name,
    type: data.type.toString(),
    gender: data.gender.toString(),
    subbranches: data.subbranches,
    categories: data.categories,
    gold_count: data.gold_count,
    silver_count: data.silver_count,
    bronze_count: data.bronze_count,
    team_min_size: data.team_min_size,
    team_max_size: data.team_max_size
  };

  const newBranch = new Branch(newBranchData);

  newBranch.save((err, branch) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err)
      return callback('database_error');

    return callback(null, branch._id.toString());
  });
};

BranchSchema.statics.findBranchByIdAndFormat = function (id, callback) {
  const Branch = this;

  Branch.findBranchById(id, (err, branch) => {
    if (err)
      return callback(err);

    getBranch(branch, (err, branch) => {
      if (err)
        return callback(err);

      return callback(null, branch);
    });
  });
};

BranchSchema.statics.findBranchCountFilters = function (data, callback) {
  const Branch = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.name && typeof data.name == 'string')
    filters.name = data.name.trim();

  Branch
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(err => callback('database_error'));
};

BranchSchema.statics.findBranchesByFilters = function (data, callback) {
  const Branch = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_ITEM_COUNT_PER_QUERY ? parseInt(data.limit) : MAX_ITEM_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) ? parseInt(data.page) * limit : 0;

  if (data.name && typeof data.name == 'string')
    filters.name = data.name.trim();

  Branch
    .find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 })
    .then(branches => async.timesSeries(
      branches.length,
      (time, next) => Branch.findBranchByIdAndFormat(branches[time]._id, (err, branch) => next(err, branch)),
      (err, branches) => {
        if (err) return callback(err);

        return callback(null, branches);
      }
    ))
    .catch(err =>  callback('database_error'));
};

BranchSchema.statics.findBranchByIdAndUpdate = function (id, data, callback) {
  const Branch = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Branch.findBranchById(id, (err, branch) => {
    if (err) return callback(err);

    if (!data.gold_count || isNaN(parseInt(data.gold_count)) || parseInt(data.gold_count) < 0)
      data.gold_count = branch.gold_count;
    else
      data.gold_count = parseInt(data.gold_count);
  
    if (!data.silver_count || isNaN(parseInt(data.silver_count)) || parseInt(data.silver_count) < 0)
      data.silver_count = branch.silver_count;
    else
      data.silver_count = parseInt(data.silver_count);
  
    if (!data.bronze_count || isNaN(parseInt(data.bronze_count)) || parseInt(data.bronze_count) < 0)
      data.bronze_count = branch.bronze_count;
    else
      data.bronze_count = parseInt(data.bronze_count);
  
    if (!data.team_min_size || isNaN(parseInt(data.team_min_size)) || parseInt(data.team_min_size) < 1)
      data.team_min_size = branch.team_min_size;
    else
      data.team_min_size = parseInt(data.team_min_size);
  
    if (!data.team_max_size || isNaN(parseInt(data.team_max_size)) || parseInt(data.team_max_size) < 1)
      data.team_max_size = branch.team_max_size;
    else
      data.team_max_size = parseInt(data.team_max_size);
  
    if (data.team_min_size && data.team_max_size && data.team_min_size < data.team_max_size) {
      data.team_min_size = branch.team_min_size;
      data.team_max_size = branch.team_max_size;
    }

    Branch.findByIdAndUpdate(branch._id, {$set: {
      name: data.name && typeof data.name == 'string' && data.name.trim().length && data.name.length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name : branch.name,
      type: data.type && type_values.includes(data.type.toString()) ? data.type.toString() : branch.type,
      subbranches: data.subbranches && Array.isArray(data.subbranches) && data.subbranches.length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.subbranches.filter(each => typeof each == 'string' && each.trim().length && each.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) : branch.subbranches,
      categories: data.categories && Array.isArray(data.categories) && data.subbranches.length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.categories.filter(each => typeof each == 'string' && each.trim().length && each.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) : branch.categories,
      gender: data.gender && gender_values.includes(data.gender.toString()) ? data.gender.toString() : branch.gender,
      gold_count: data.gold_count,
      silver_count: data.silver_count,
      bronze_count: data.bronze_count,
      team_min_size: data.team_min_size,
      team_max_size: data.team_max_size
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);   
    });
  });
};

BranchSchema.statics.findAllBranchesInAlphabeticalOrder = function (callback) {
  const Branch = this;

  Branch
    .find({})
    .sort({ name: 1 })
    .then(branches => async.timesSeries(
      branches.length,
      (time, next) => Branch.findBranchByIdAndFormat(branches[time]._id, (err, branch) => next(err, branch)),
      (err, branches) => {
        if (err) return callback(err);

        return callback(null, branches);
      }
    ))
    .catch(err => callback('database_error'));
};

if (!mongoose.models.Branch)
  mongoose.model('Branch', BranchSchema);

module.exports = mongoose.models.Branch;
