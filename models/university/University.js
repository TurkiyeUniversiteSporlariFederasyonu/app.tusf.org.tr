const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Image = require('../image/Image');

const getUniversity = require('./functions/getUniversity');
const isUniversityReadyToBeComplete = require('./functions/isUniversityReadyToBeComplete');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 1e3;

const type_values = ['public', 'private'];
const city_values = ['Adana', 'Adıyaman', 'Afyon', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir',   'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya',   'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya',  'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',  'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',  'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'];
const cyprus_city_values = ['Gazimağusa', 'Girne', 'Güzelyurt', 'İskele', 'Lefke', 'Lefkoşa'];
const position_names = {
  rector: 'Rektörlük',
  health_culture_and_sport_department_president: 'Sağlık Kültür ve Spor Daire Başkanlığı',
  sport_sciences_dean: 'Spor Bilimleri Fakültesi Dekanlığı',
  sport_high_education_president: 'Beden Eğitimi ve Spor Yüksekokulu Müdürlüğü'
};

const Schema = mongoose.Schema;

const UniversitySchema = new Schema({
  is_cyprus_university: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    rdefault: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  logo: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  short_name: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  city: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  rector: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  health_culture_and_sport_department_president: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  sport_sciences_dean: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  sport_high_education_president: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  }
});

UniversitySchema.statics.findUniversityById = function (id, callback) {
  const University = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  University.findById(mongoose.Types.ObjectId(id.toString()), (err, university) => {
    if (err) return callback('database_error');
    if (!university) return callback('document_not_found');

    return callback(null, university);
  });
};

UniversitySchema.statics.findUniversityByIdAndFormat = function (id, callback) {
  const University = this;

  University.findUniversityById(id, (err, university) => {
    if (err) return callback(err);

    isUniversityReadyToBeComplete(university, (err, res) => {
      if (err) return callback(err);

      if (res == university.is_completed) {
        getUniversity(university, (err, university) => {
          if (err) return callback(err);
    
          return callback(null, university);
        });
      } else {
        University.findByIdAndUpdate(university._id, {$set: {
          is_completed: res
        }}, { new: true }, (err, university) => {
          if (err) return callback('database_error');
  
          getUniversity(university, (err, university) => {
            if (err) return callback(err);
      
            return callback(null, university);
          });
        });
      }
    });
  });
};

UniversitySchema.statics.findUniversityByIdAndUpdate = function (id, data, callback) {
  const University = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  University.findUniversityById(id, (err, university) => {
    if (err)
      return callback(err);

    Image.findImageByUrl(data.logo, (err, image) => {
      if (err)
        data.logo = null;
      else
        data.logo = image.url;

      University.findByIdAndUpdate(university._id, {$set: {
        type: data.type && type_values.includes(data.type.toString().trim()) ? data.type.toString().trim() : university.type,
        short_name: data.short_name && typeof data.short_name == 'string' && data.short_name.trim().length && data.short_name.length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.short_name.trim() : university.short_name,
        city: (data.city && (data.is_cyprus_university ? cyprus_city_values : city_values).includes(data.city)) ? data.city : university.city,
        rector: data.rector && typeof data.rector && data.rector.trim().length ? data.rector : university.rector,
        health_culture_and_sport_department_president: data.health_culture_and_sport_department_president && typeof data.health_culture_and_sport_department_president && data.health_culture_and_sport_department_president.trim().length ? data.health_culture_and_sport_department_president : university.health_culture_and_sport_department_president,
        sport_sciences_dean: data.sport_sciences_dean && typeof data.sport_sciences_dean && data.sport_sciences_dean.trim().length ? data.sport_sciences_dean : null,
        sport_high_education_president: data.sport_high_education_president && typeof data.sport_high_education_president && data.sport_high_education_president.trim().length ? data.sport_high_education_president : university.sport_high_education_president,
        logo: data.logo
      }}, { new: true }, (err, university) => {
        if (err)
          return callback('database_error');
    
        isUniversityReadyToBeComplete(university, (err, res) => {
          if (err) return callback(err);
    
          if (university.is_completed == res)
            return callback(null);
    
          University.findByIdAndUpdate(university._id, {$set: {
            is_completed: res
          }}, err => {
            if (err) return callback('database_error');
    
            return callback(null); 
          });
        });     
      });
    });
  });
};

UniversitySchema.statics.findUniversityCountFilters = function (data, callback) {
  const University = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.name && typeof data.name == 'string')
    filters.name = data.name.trim();

  University
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(err => callback('database_error'));
};

UniversitySchema.statics.findUniversitiesByFilters = function (data, callback) {
  const University = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_ITEM_COUNT_PER_QUERY ? parseInt(data.limit) : MAX_ITEM_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) ? parseInt(data.page) * limit : 0;

  if (data.name && typeof data.name == 'string')
    filters.name = data.name.trim();

  University
    .find(filters)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 })
    .then(universitys => async.timesSeries(
      universitys.length,
      (time, next) => University.findUniversityByIdAndFormat(universitys[time]._id, (err, university) => next(err, university)),
      (err, universitys) => {
        if (err) return callback(err);

        return callback(null, universitys);
      }
    ))
    .catch(err =>  callback('database_error'));
};

module.exports = mongoose.model('University', UniversitySchema);
