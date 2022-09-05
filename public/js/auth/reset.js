window.addEventListener('load', () => {
  document.getElementById('form').onsubmit = event => {
    event.preventDefault();

    const id = JSON.parse(document.getElementById('id').value);
    const token = JSON.parse(document.getElementById('token').value);

    const password = document.getElementById('password-input').value;
    const confirmPassword = document.getElementById('confirm-password-input').value;

    const error = document.getElementById('error');

    error.innerHTML = '';

    if (!password || !password.length)
      return error.innerHTML = 'Lütfen yeni bir şifre girin.';
    if (password.length < 8)
      return error.innerHTML = 'Şifreniz en az 8 karakterli olmalıdır.';
    if (password != confirmPassword)
      return error.innerHTML = 'Lütfen şifrenizi onaylayın.'

    serverRequest('/auth/reset', 'POST', {
      _id: id,
      password_update_verification_token: token,
      password
    }, res => {
      if (!res.success)
        return error.innerHTML = 'Bilinmeyen bir hata oluştu, lütfen daha sonra tekrar deneyin.';

      return window.location = '/auth/login';
    });
  }
});
