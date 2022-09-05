const Participation = require('../../../models/participation/Participation');

module.exports = (req, res) => {
  Participation.findOldParticipationsForUniversity(req.session.user.university._id, (err, participations) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('participation/old', {
      page: 'participation/old',
      title: 'Geçmiş Branş Katılımı',
      includes: {
        external: {
          css: ['confirm', 'bread-cramp', 'header', 'fontawesome', 'general', 'list', 'page', 'text'],
          js: ['confirm', 'ancestorWithClassName', 'header', 'page', 'serverRequest', 'throwError']
        }
      },
      url: '/participation/old',
      user: req.session.user,
      participations
    });
  });
}
