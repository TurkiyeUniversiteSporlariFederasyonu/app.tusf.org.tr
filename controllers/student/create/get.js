module.exports = (req, res) => {
  return res.render('student/create', {
    page: 'student/create',
    title: 'Yeni Öğrenci Ekle',
    includes: {
      external: {
        css: ['bread-cramp', 'form', 'header', 'general', 'input', 'page', 'text'],
        js: ['ancestorWithClassName', 'header', 'input', 'page', 'serverRequest']
      }
    },
    url: '/student/create',
    user: req.session.user
  });
}
