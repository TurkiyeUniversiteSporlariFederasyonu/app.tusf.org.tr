module.exports = (req, res) => {
  return res.render('index/index', {
    page: 'index/index',
    title: 'Ana Sayfa',
    includes: {
      external: {
        css: ['header', 'general', 'page'],
        js: ['ancestorWithClassName', 'header']
      }
    },
    user: req.session.user
  });
}
