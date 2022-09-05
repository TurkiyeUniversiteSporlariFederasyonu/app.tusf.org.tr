module.exports = (req, res, next) => {
  const user = req.session.user;

  if (!user.is_completed)
    return res.redirect('/settings');
  if (!user.university.is_completed)
    return res.redirect('/settings/university');

  return next();
}
