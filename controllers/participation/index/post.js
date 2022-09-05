const Participation = require('../../../models/participation/Participation');

module.exports = (req, res) => {
  Participation.findParticipationByUniversityIdAndUpdateBranches(req.session.user.university._id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}
