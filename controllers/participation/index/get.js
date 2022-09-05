const Branch = require('../../../models/branch/Branch');
const Participation = require('../../../models/participation/Participation');
const Year = require('../../../models/year/Year');

module.exports = (req, res) => {
  Year.findCurrentYear((err, year) => {
    if (err)
      return res.redirect('/error?message=' + err);

    Branch.findAllBranchesInAlphabeticalOrder((err, branches) => {
      if (err)
        return res.redirect('/error?message=' + err);
      
      Year.findYearByIdAndFormat(year._id, (err, year_format) => {
        if (err)
          return res.redirect('/error?message=' + err);

        Participation.findCurrentParticipationsByUniversityIdAndFormat(req.session.user.university._id, (err, participation) => {
          if (err)
            return res.redirect('/error?message=' + err);
        
          return res.render('participation/index', {
            page: 'participation/index',
            title: `Branş Katılımı (${participation.season})`,
            includes: {
              external: {
                css: ['bread-cramp', 'form', 'header', 'general', 'input', 'page', 'text'],
                js: ['ancestorWithClassName', 'header', 'input', 'page', 'serverRequest']
              }
            },
            url: '/participation',
            user: req.session.user,
            participation,
            branches,
            participation_update_start_date: year.participation_update_start_date,
            participation_update_end_date: year.participation_update_end_date,
            participation_update_start_date_format: year_format.participation_update_start_date,
            participation_update_end_date_format: year_format.participation_update_end_date
          });
        });
      });
    });
  });
}
