window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.id == 'save-button') {
      const error = document.getElementById('error');
      error.innerHTML = '';
      
      const oldPassword = document.getElementById('old-password-input').value;
      const password = document.getElementById('password-input').value;
      const confirmPassword = document.getElementById('confirm-password-input').value;

      if (!oldPassword || !oldPassword.trim().length)
        return error.innerHTML = 'Lütfen eski şifrenizi girin.';

      if (!password || !password.trim().length)
        return error.innerHTML = 'Lütfen geçerli bir şifre girin.';

      if (password.trim().length < 8)
        return error.innerHTML = 'Girdiğiniz şifre en az 8 karakterli olmalıdır.';

      if (password.trim() != confirmPassword.trim())
        return error.innerHTML = 'Lütfen şifrenizi tekrar edin.';

      serverRequest('/settings/password', 'POST', {
        old_password: oldPassword,
        new_password: password
      }, res => {
        if (!res.success && res.error == 'password_verification')
          return error.innerHTML = 'Girdiğiniz şifre yanlış.';
        if (!res.success)
          return error.innerHTML = 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        
        return window.location = '/auth/logout';
      });
    }
  });
});
