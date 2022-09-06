const async = require('async');
const mongoose = require('mongoose');

const getCurrentSeason = require('../../utils/getCurrentSeason');

const Branch = require('../branch/Branch');
const University = require('../university/University');
const Year = require('../year/Year');

const gender_values = ['female', 'male'];

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_ITEM_COUNT_PER_QUERY = 1e3;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const Schema = mongoose.Schema;

const ParticipationSchema = new Schema({
  season: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  university_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  female_branch_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  male_branch_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  female_branch_id_list_length: {
    type: Number,
    default: 0,
    max: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  male_branch_id_list_length: {
    type: Number,
    default: 0,
    max: MAX_DATABASE_ARRAY_FIELD_LENGTH
  }
});

ParticipationSchema.statics.findParticipationByUniversityIdAndPushBranch = function (university_id, data, callback) {
  const Participation = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.gender || !gender_values.includes(data.gender))
    return callback('bad_request');

  University.findUniversityById(university_id, (err, university) => {
    if (err) return callback(err);

    Branch.findBranchById(data.branch_id, (err, branch) => {
      if (err) return callback(err);
  
      Participation.findOne({
        season: getCurrentSeason(),
        university_id: university._id,
        [data.gender + '_branch_id_list']: branch._id
      }, (err, participation) => {
        if (err) return callback('database_error');
        if (participation)
          return callback(null);

        Participation.findOne({
          season: getCurrentSeason(),
          university_id: university._id,
          [data.gender +  '_branch_id_list_length']: { $lt: MAX_DATABASE_ARRAY_FIELD_LENGTH }
        }, (err, participation) => {
          if (err) return callback('database_error');

          if (participation) {
            Participation.findByIdAndUpdate(participation._id, {
              $push: { [data.gender + '_branch_id_list']: branch._id },
              $inc: { [data.gender +  '_branch_id_list_length']: 1 }
            }, err => {
              if (err) return callback('database_error');

              return callback(null);
            });
          } else {
            const newParticipationData = {
              season: getCurrentSeason(),
              university_id: university._id,
              [data.gender + '_branch_id_list']: [ branch._id ],
              [data.gender +  '_branch_id_list_length']: 1
            };

            const newParticipation = new Participation(newParticipationData);

            newParticipation.save(err => {
              if (err) return callback('database_error');

              return callback(null);
            });
          }
        });
      });
    });
  });
};

ParticipationSchema.statics.findParticipationByUniversityIdAndPullBranch = function (university_id, data, callback) {
  const Participation = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.gender || !gender_values.includes(data.gender))
    return callback('bad_request');

  University.findUniversityById(university_id, (err, university) => {
    if (err) return callback(err);

    Branch.findBranchById(data.branch_id, (err, branch) => {
      if (err) return callback(err);
  
      Participation.findOne({
        season: getCurrentSeason(),
        university_id: university._id,
        [data.gender + '_branch_id_list']: branch._id
      }, (err, participation) => {
        if (err) return callback('database_error');
        if (!participation)
          return callback(null);

        Participation.findByIdAndUpdate(participation._id, {
          $pull: { [data.gender + '_branch_id_list']: branch._id },
          $inc: { [data.gender + '_branch_id_list_length']: -1 }
        }, err => {
          if (err) return callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

ParticipationSchema.statics.findParticipationByUniversityIdAndUpdateBranches = function (university_id, data, callback) { // O(n^2) - not optimized
  const Participation = this;

  if (!data.female_branch_id_list || !Array.isArray(data.female_branch_id_list))
    return callback('bad_request');

  data.female_branch_id_list = data.female_branch_id_list.map(each => each.toString());

  if (!data.male_branch_id_list || !Array.isArray(data.male_branch_id_list))
    return callback('bad_request');

  data.male_branch_id_list = data.male_branch_id_list.map(each => each.toString());

  Year.findCurrentYear((err, year) => {
    if (err) return callback(err);

    if (year.participation_update_start_date.getTime() > (new Date()).getTime())
      return callback('not_authenticated_request');

    if (year.participation_update_end_date.getTime() + ONE_DAY_IN_MS < (new Date()).getTime())
      return callback('not_authenticated_request');

    University.findUniversityById(university_id, (err, university) => {
      if (err) return callback(err);

      Branch.findBranchCountFilters({}, (err, branch_count) => {
        if (err) return callback(err);

        const queryRepeatCount = parseInt(branch_count / MAX_ITEM_COUNT_PER_QUERY) + ((branch_count % MAX_ITEM_COUNT_PER_QUERY != 0) ? 1 : 0);

        async.timesSeries(
          queryRepeatCount,
          (time, next) => {
            Branch.findBranchesByFilters({
              page: time,
              limit: MAX_ITEM_COUNT_PER_QUERY
            }, (err, branches) => {
              if (err) return next(err);

              async.timesSeries(
                branches.length,
                (time, next) => {
                  if (data.female_branch_id_list.includes(branches[time]._id.toString()))
                    Participation.findParticipationByUniversityIdAndPushBranch(university._id, {
                      gender: 'female',
                      branch_id: branches[time]._id
                    }, err => {
                      if (err) return next(err);

                      if (data.male_branch_id_list.includes(branches[time]._id.toString()))
                        Participation.findParticipationByUniversityIdAndPushBranch(university._id, {
                          gender: 'male',
                          branch_id: branches[time]._id
                        }, err => next(err));
                      else
                        Participation.findParticipationByUniversityIdAndPullBranch(university._id, {
                          gender: 'male',
                          branch_id: branches[time]._id
                        }, err => next(err));
                    });
                  else
                    Participation.findParticipationByUniversityIdAndPullBranch(university._id, {
                      gender: 'female',
                      branch_id: branches[time]._id
                    }, err => {
                      if (err) return next(err);

                      if (data.male_branch_id_list.includes(branches[time]._id.toString()))
                        Participation.findParticipationByUniversityIdAndPushBranch(university._id, {
                          gender: 'male',
                          branch_id: branches[time]._id
                        }, err => next(err));
                      else
                        Participation.findParticipationByUniversityIdAndPullBranch(university._id, {
                          gender: 'male',
                          branch_id: branches[time]._id
                        }, err => next(err));
                    });
                },
                err => {
                  if (err) return next(err);

                  return next(null);
                }
              );
            });
          },
          err => {
            if (err) return callback(err);

            return callback(null);
          }
        );
      });
    });
  });
};

ParticipationSchema.statics.findParticipationsBySeasonAndByUniversityIdAndFormat = function (university_id, season, callback) {
  const Participation = this;

  if (!season || typeof season != 'string')
    return callback('bad_request');

  University.findUniversityById(university_id, (err, university) => {
    if (err) return callback(err);

    Participation.find({
      season,
      university_id: university._id
    }, (err, participations) => {
      if (err) return callback('database_error');

      const data = {
        season,
        female_branch_id_list: [],
        male_branch_id_list: []
      }

      async.timesSeries(
        participations.length,
        (time, next) => {
          const participation = participations[time];

          async.timesSeries(
            participation.female_branch_id_list.length,
            (time, next) => Branch.findBranchById(participation.female_branch_id_list[time], (err, branch) => {
              if (err) return next(err);

              return next(null, branch._id.toString());
            }),
            (err, female_branch_id_list) => {
              if (err) return next(err);

              data.female_branch_id_list = data.female_branch_id_list.concat(female_branch_id_list);
              
              async.timesSeries(
                participation.male_branch_id_list.length,
                (time, next) => Branch.findBranchById(participation.male_branch_id_list[time], (err, branch) => {
                  if (err) return next(err);
    
                  return next(null, branch._id.toString());
                }),
                (err, male_branch_id_list) => {
                  if (err) return next(err);
    
                  data.male_branch_id_list = data.male_branch_id_list.concat(male_branch_id_list);
                  return next(null);
                }
              );
            }
          );
        },
        err => {
          if (err) return callback(err);

          return callback(null, data);
        }
      );
    });
  });
};

ParticipationSchema.statics.findCurrentParticipationsByUniversityIdAndFormat = function (university_id, callback) {
  const Participation = this;

  Participation.findParticipationsBySeasonAndByUniversityIdAndFormat(university_id, getCurrentSeason(), (err, participation) => {
    if (err) return callback(err)

    return callback(null, participation);
  });
};

ParticipationSchema.statics.findOldParticipationsForUniversity = function (university_id, callback) {
  const Participation = this;

  University.findUniversityById(university_id, (err, university) => {
    if (err) return callback(err);

    Participation
      .find({
        season: { $ne: getCurrentSeason() },
        university_id: university._id
      })
      .sort({ season: -1 })
      .then(participations => {
        const new_participations = [];

        async.timesSeries(
          participations.length,
          (time, next) => {
            const participation = participations[time];

            if (!new_participations.length || new_participations[new_participations.length-1].season != participation.season)
              new_participations.push({ season: participation.season });

            return next(null);
          },
          err => {
            if (err) return callback('unknown_error');

            return callback(null, new_participations);
          }
        );
      })
      .catch(err => callback('database_error'));
  });
};

if (!mongoose.models.Participation)
  mongoose.model('Participation', ParticipationSchema);

module.exports = mongoose.models.Participation;
