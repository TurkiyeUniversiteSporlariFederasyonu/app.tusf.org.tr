const moment = require('moment-timezone');

module.exports = (year, callback) => {
  if (!year || !year._id)
    return callback('document_not_found');

  return callback(null, {
    _id: year._id.toString(),
    season: year.season,
    participation_update_start_date: moment(year.participation_update_start_date).format('DD[.]MM[.]YYYY'),
    participation_update_end_date: moment(year.participation_update_end_date).format('DD[.]MM[.]YYYY')
  });
}
