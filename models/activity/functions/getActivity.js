const moment = require('moment-timezone');

const Branch = require('../../branch/Branch');
const University = require('../../university/University');

module.exports = (activity, callback) => {
  if (!activity || !activity._id)
    return callback('document_not_found');

  Branch.findBranchByIdAndFormat(activity.branch_id, (err, branch) => {
    if (err) return callback(err);

    University.findUniversityByIdAndFormat(activity.university_id, (err, university) => {
      if (err) return callback(err);

      return callback(null, {
        _id: activity._id.toString(),
        name: activity.name.replace('_' + activity._id, ''),
        season: activity.season,
        type: activity.type,
        stage: activity.stage,
        is_deleted: activity.is_deleted,
        gender: activity.gender,
        other_details: activity.other_details,
        is_active: activity.is_active,
        is_on_calendar: activity.is_on_calendar,
        is_without_age_control: activity.is_without_age_control,
        athlete_count: activity.athlete_count,
        foreign_athlete_count: activity.foreign_athlete_count,
        start_date: moment(activity.start_date).format('DD[.]MM[.]YYYY'),
        end_date: moment(activity.end_date).format('DD[.]MM[.]YYYY'),
        last_application_date: moment(activity.last_application_date).format('DD[.]MM[.]YYYY'),
        federation_representative: activity.federation_representative,
        technique_meeting: {
          time: {
            date: activity.technique_meeting.time ? moment(activity.technique_meeting.time).locale('tr').format('DD[.]MM[.]YYYY') : null,
            hour: activity.technique_meeting.time ? moment(activity.technique_meeting.time).locale('tr').format('kk[:]mm') : null
          },
          place: activity.technique_meeting.place
        },
        branch,
        university
      });
    });
  });
}
