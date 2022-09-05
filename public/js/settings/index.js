window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.id == 'save-button') {
      const error = document.getElementById('error');
      error.innerHTML = '';
      
      const name = document.getElementById('name-input').value;
      const phoneNumber = document.getElementById('phone-input').value;
      const title = document.getElementById('title-input').value;

      if (!name || !name.trim().length)
        return error.innerHTML = 'Lütfen adınızı ve soyadınızı girin.';

      if (!phoneNumber || !phoneNumber.trim().length)
        return error.innerHTML = 'Lütfen telefon numaranızı girin.';

      if (!title || !title.trim().length)
        return error.innerHTML = 'Lütfen ünvanınızı girin.';

      serverRequest('/settings', 'POST', {
        name,
        phone_number: phoneNumber,
        title
      }, res => {
        if (!res.success)
          return error.innerHTML = 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        
        return window.location = '/';
      });
    }
  });
});
