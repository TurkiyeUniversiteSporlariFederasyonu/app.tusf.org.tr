module.exports = (req, res) => {
  return res.render('settings/index', {
    page: 'settings/index',
    title: 'Ayarlar',
    includes: {
      external: {
        css: ['bread-cramp', 'form', 'header', 'general', 'input', 'page', 'text'],
        js: ['ancestorWithClassName', 'header', 'input', 'page', 'serverRequest']
      }
    },
    url: '/settings',
    user: req.session.user
  });
}
