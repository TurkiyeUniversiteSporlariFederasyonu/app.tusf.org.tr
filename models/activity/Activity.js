const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Branch = require('../branch/Branch');
const University = require('../university/University');

const formatActivityName = require('./functions/formatActivityName');
const formatPhoneNumber = require('./functions/formatPhoneNumber');
const getActivity = require('./functions/getActivity');

const gender_values = ['male', 'female', 'mix'];
const type_values = ['1. Lig', '2. Lig', 'Grup Müsabakaları', 'Klasman Ligi', 'Playoff', 'Süper Lige Yükselme', 'Süperlig', 'Şenlik', 'Turnuva', 'Türkiye Kupası', 'Türkiye Şampiyonası', 'Kış Spor Oyunları Seçme Müsabakaları'];
const stage_values = ['1. Etap', '2. Etap', '3. Etap', '4. Etap', 'ÜNİLİG', 'ÜNİLİG Finalleri', 'Fetih Sporfest', 'GNÇ Sporfest'];

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 1e3;

const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  branch_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  season: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  type: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  stage: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  university_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  other_details: {
    type: String,
    default: null,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_on_calendar: {
    type: Boolean,
    default: true
  },
  is_without_age_control: {
    type: Boolean,
    default: false
  },
  athlete_count: {
    default: null,
    type: Number
  },
  foreign_athlete_count: {
    default: null,
    type: Number
  },
  start_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  last_application_date: {
    type: String,
    type: Date,
    default: null
  },
  federation_representative: {
    type: Object,
    default: {
      name: null,
      phone_number: null
    }
  },
  technique_meeting: {
    type: Object,
    default: {
      place: null,
      time: null
    }
  }
});

ActivitySchema.statics.findActivityById = function (id, callback) {
  const Activity = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Activity.findById(mongoose.Types.ObjectId(id.toString()), (err, activity) => {
    if (err) return callback('database_error');
    if (!activity) return callback('document_not_found');

    return callback(null, activity);
  });
};

ActivitySchema.statics.createActivity = function (data, callback) {
  const Activity = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Branch.findBranchById(data.branch_id, (err, branch) => {
    if (err) return callback(err);

    University.findUniversityById(data.university_id, (err, university) => {
      if (err) return callback(err);

      if (isNaN((new Date(data.season)).getFullYear()))
        return callback('bad_request');

      if (!data.type || !type_values.includes(data.type))
        return callback('bad_request');

      if (!data.stage || !stage_values.includes(data.stage))
        return callback('bad_request');

      if (!data.gender || !gender_values.includes(data.gender))
        return callback('bad_request');

      const newActivityData = {
        branch_id: branch._id,
        season: ((new Date(data.season)).getFullYear()) + ' - ' + ((new Date(data.season)).getFullYear() + 1),
        type: data.type,
        stage: data.stage,
        university_id: university._id,
        gender: data.gender,
        other_details: data.other_details && typeof data.other_details == 'string' && data.other_details.trim().length && data.other_details.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.other_details.trim() : null,
        is_active: data.is_active ? true : false,
        is_on_calendar: data.is_on_calendar ? true : false,
        is_without_age_control: data.is_without_age_control ? true : false,
        athlete_count: data.athlete_count && !isNaN(parseInt(data.athlete_count)) ? parseInt(data.athlete_count) : null,
        foreign_athlete_count: data.foreign_athlete_count && !isNaN(parseInt(data.foreign_athlete_count)) ? parseInt(data.foreign_athlete_count) : null,
        start_date: data.start_date && !isNaN(new Date(data.start_date)) ? new Date(data.start_date) : null,
        end_date: data.end_date && !isNaN(new Date(data.end_date)) ? new Date(data.end_date) : null,
        last_application_date: data.last_application_date && !isNaN(new Date(data.last_application_date)) ? new Date(data.last_application_date) : null,
        federation_representative: (data.federation_representative && typeof data.federation_representative == 'object' ?
        {
          name: data.federation_representative.name && typeof data.federation_representative.name == 'string' && data.federation_representative.name.trim().length && data.federation_representative.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.federation_representative.name.trim() : null,
          phone_number: formatPhoneNumber(data.federation_representative.phone_number) ? formatPhoneNumber(data.federation_representative.phone_number) : null
        } :
        {
          name: null,
          phone_number: null
        }),
        technique_meeting: (data.technique_meeting && typeof data.technique_meeting == 'object' ?
        {
          place: data.technique_meeting.place && typeof data.technique_meeting.place == 'string' && data.technique_meeting.place.trim().length && data.technique_meeting.place.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.technique_meeting.place.trim() : null,
          time: data.technique_meeting.time && !isNaN(new Date(data.technique_meeting.time)) ? new Date(data.technique_meeting.time) : null,
        } :
        {
          place: null,
          time: null
        })
      }

      newActivityData.name = formatActivityName({
        season: newActivityData.season,
        branch_name: branch.name,
        type: newActivityData.type,
        stage: newActivityData.stage,
        university_name: university.name,
        gender: newActivityData.gender
      });

      if (!newActivityData.name)
        return callback('bad_request');

      const newActivity = new Activity(newActivityData);

      newActivity.save((err, activity) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err)
          return callback(err);
        
        return callback(null, activity._id.toString());
      });
    });
  });
};

ActivitySchema.statics.findActivityByIdAndFormat = function (id, callback) {
  const Activity = this;

  Activity.findActivityById(id, (err, activity) => {
    if (err)
      return callback(err);

    getActivity(activity, (err, activity) => {
      if (err)
        return callback(err);

      return callback(null, activity);
    });
  });
};

ActivitySchema.statics.findActivityCountFilters = function (data, callback) {
  const Activity = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.is_deleted)
    filters.is_deleted = true;
  else
    filters.is_deleted = { $ne: true };

  if (data.name && typeof data.name == 'string')
    filters.name = data.name.trim();

  Activity
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(err => callback('database_error'));
};

ActivitySchema.statics.findActivitiesByFilters = function (data, callback) {
  const Activity = this;

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

  Activity
    .find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 })
    .then(activities => async.timesSeries(
      activities.length,
      (time, next) => Activity.findActivityByIdAndFormat(activities[time]._id, (err, activity) => next(err, activity)),
      (err, activities) => {
        if (err) return callback(err);

        return callback(null, activities);
      }
    ))
    .catch(err =>  callback('database_error'));
};

ActivitySchema.statics.findActivityByIdAndUpdate = function (id, data, callback) {
  const Activity = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Activity.findActivityById(id, (err, activity) => {
    if (err) return callback(err);

    Activity.findActivityByIdAndFormat(id, (err, format_activity) => {
      if (err) return callback(err);

      const update = {
        branch_id: activity.branch_id,
        season: data.season && !isNaN((new Date(data.season))) ? (((new Date(data.season)).getFullYear()) + '-' + ((new Date(data.season)).getFullYear() + 1)) : activity.season,
        type: data.type && type_values.includes(data.type) ? data.type : activity.type,
        stage: data.stage && stage_values.includes(data.stage) ? data.stage : activity.stage,
        university_id: activity.university_id,
        gender: data.gender && gender_values.includes(data.gender) ? data.gender : activity.gender,
        other_details: data.other_details && typeof data.other_details == 'string' && data.other_details.trim().length && data.other_details.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.other_details.trim() : null,
        is_active: data.is_active ? true : false,
        is_on_calendar: data.is_on_calendar ? true : false,
        is_without_age_control: data.is_without_age_control ? true : false,
        athlete_count: data.athlete_count && !isNaN(parseInt(data.athlete_count)) ? parseInt(data.athlete_count) : activity.athlete_count,
        foreign_athlete_count: data.foreign_athlete_count && !isNaN(parseInt(data.foreign_athlete_count)) ? parseInt(data.foreign_athlete_count) : activity.foreign_athlete_count,
        start_date: data.start_date && !isNaN(new Date(data.start_date)) ? new Date(data.start_date) : activity.start_date,
        end_date: data.end_date && !isNaN(new Date(data.end_date)) ? new Date(data.end_date) : activity.end_date,
        last_application_date: data.last_application_date && !isNaN(new Date(data.last_application_date)) ? new Date(data.last_application_date) : activity.last_application_date,
        federation_representative: (data.federation_representative && typeof data.federation_representative == 'object' ?
        {
          name: data.federation_representative.name && typeof data.federation_representative.name == 'string' && data.federation_representative.name.trim().length && data.federation_representative.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.federation_representative.name.trim() : null,
          phone_number: formatPhoneNumber(data.federation_representative.phone_number) ? formatPhoneNumber(data.federation_representative.phone_number) : null
        } :
        {
          name: activity.federation_representative.name,
          phone_number: activity.federation_representative.phone_number
        }),
        technique_meeting: (data.technique_meeting && typeof data.technique_meeting == 'object' ?
        {
          place: data.technique_meeting.place && typeof data.technique_meeting.place == 'string' && data.technique_meeting.place.trim().length && data.technique_meeting.place.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.technique_meeting.place.trim() : null,
          time: data.technique_meeting.time && !isNaN(new Date(data.technique_meeting.time)) ? new Date(data.technique_meeting.time) : null,
        } :
        {
          place: activity.technique_meeting.place,
          time: activity.technique_meeting.time
        })
      };

      Branch.findBranchById(data.branch_id, (branch_err, branch) => {
        if (!branch_err) update.branch_id = branch._id;

        University.findUniversityById(data.university_id, (university_err, university) => {
          if (!university_err) update.university_id = university._id;

          update.name = formatActivityName({
            season: update.season,
            branch_name: !branch_err ? branch.name : format_activity.branch.name,
            type: update.type,
            stage: update.stage,
            university_name: !university_err ? university.name : format_activity.university.name,
            gender: update.gender
          });
    
          if (!update.name)
            return callback('bad_request');
  
          Activity.findByIdAndUpdate(activity._id, {$set: update}, err => {
            if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
              return callback('duplicated_unique_field');
            if (err)
              return callback('database_error');
  
            return callback(null);
          });
        });
      });
    }); 
  });
};

ActivitySchema.statics.findActivityByIdAndDelete = function (id, callback) {
  const Activity = this;

  Activity.findActivityById(id, (err, activity) => {
    if (err) return callback(err);

    if (activity.is_deleted)
      return callback(null);

    Activity.findByIdAndUpdate(activity._id, {$set: {
      name: activity.name + '_' + activity._id.toString(),
      is_deleted: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

ActivitySchema.statics.findActivityByIdAndRestore = function (id, callback) {
  const Activity = this;

  Activity.findActivityById(id, (err, activity) => {
    if (err) return callback(err);

    if (!activity.is_deleted)
      return callback(null);

    Activity.findByIdAndUpdate(activity._id, {$set: {
      name: activity.name.replace('_' + activity._id.toString(), ''),
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

module.exports = mongoose.model('Activity', ActivitySchema);
