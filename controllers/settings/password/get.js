module.exports = (req, res) => {
  return res.render('settings/password', {
    page: 'settings/password',
    title: 'Şifreyi Değiştir',
    includes: {
      external: {
        css: ['bread-cramp', 'form', 'header', 'general', 'input', 'page', 'text'],
        js: ['ancestorWithClassName', 'header', 'input', 'page', 'serverRequest']
      }
    },
    url: '/settings/password',
    user: req.session.user
  });
}
