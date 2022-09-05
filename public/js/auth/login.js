window.addEventListener('load', () => {
  document.getElementById('form').onsubmit = event => {
    event.preventDefault();

    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const error = document.getElementById('error');

    error.innerHTML = '';

    if (!email || !email.length)
      return error.innerHTML = 'Lütfen geçerli bir e-posta adresi girin.';

    if (!password || !password.length)
      return error.innerHTML = 'Lütfen geçerli bir şifre girin.';

    serverRequest('/auth/login', 'POST', {
      email,
      password
    }, res => {
      if (!res.success && res.error == 'document_not_found')
        return error.innerHTML = 'Bu e-posta adresi ile kayıtlı bir hesap bulunmuyor.';
      if (!res.success && res.error == 'password_verification')
        return error.innerHTML = 'Girdiğiniz şifre yanlış.';
      if (!res.success)
        return error.innerHTML = 'Bilinmeyen bir hata oluştu, lütfen daha sonra tekrar deneyin.';

      if (res.redirect && res.redirect.length)
        return window.location = res.redirect;
      else
        return window.location = '/';
    });
  }
});
