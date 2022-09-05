module.exports = (req, res) => {
  return res.render('auth/password', {
    page: 'auth/password',
    title: 'Şifremi Unuttum',
    includes: {
      external: {
        css: ['confirm', 'form', 'general', 'input', 'page', 'text'],
        js: ['confirm', 'page', 'serverRequest']
      }
    }
  });
}
