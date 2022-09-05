module.exports = (req, res) => {
  return res.render('auth/reset', {
    page: 'auth/reset',
    title: 'Şifreyi Sıfırla',
    includes: {
      external: {
        css: ['form', 'general', 'input', 'page', 'text'],
        js: ['page', 'serverRequest']
      }
    },
    id: req.query.id,
    email: req.query.email,
    token: req.query.token
  });
}
