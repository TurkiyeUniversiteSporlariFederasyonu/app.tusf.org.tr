window.addEventListener('load', () => {
  document.getElementById('form').onsubmit = event => {
    event.preventDefault();

    const email = document.getElementById('email-input').value;
    const error = document.getElementById('error');

    error.innerHTML = '';

    if (!email || !email.length)
      return error.innerHTML = 'Lütfen geçerli bir e-posta adresi girin.';

    serverRequest('/auth/password?email=' + email, 'POST', {}, res => {
      if (!res.success && res.error == 'bad_request')
        return error.innerHTML = 'Lütfen geçerli bir e-posta adresi girin.';
      if (!res.success && res.error == 'document_not_found')
        return error.innerHTML = 'Bu e-posta adresi ile kayıtlı bir hesap bulunmuyor.';
      if (!res.success)
        return error.innerHTML = 'Bilinmeyen bir hata oluştu, lütfen daha sonra tekrar deneyin.';

      return createConfirm({
        title: 'Şifre Sıfırlama Talebiniz Alındı',
        text: 'Girdiğiniz e-posta adresine şifre sıfırlama talebiniz hakkında bir e-posta gönderildi. Lütfen gönderilen e-postadaki adımları izleyerek şifrenizi sıfırlayın.',
        accept: 'Kapat'
      }, res => {
        return window.location = '/auth/login';
      });
    });
  }
});
