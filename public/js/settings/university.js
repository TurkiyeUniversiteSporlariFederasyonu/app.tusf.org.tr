let cities;

window.addEventListener('load', () => {
  cities = JSON.parse(document.getElementById('cities').value);

  document.addEventListener('click', event => {
    if (event.target.id == 'save-button') {
      const error = document.getElementById('error');
      error.innerHTML = '';
      
      const shortName = document.getElementById('short-name-input').value;
      const type = document.getElementById('type-input').value;
      const rector = document.getElementById('rector-input').value;
      const logo = document.getElementById('logo-input-wrapper').querySelector('img') ? document.getElementById('logo-input-wrapper').querySelector('img').src : null;
      const city = document.getElementById('city-input').value;

      if (!shortName || !shortName.trim().length)
        return error.innerHTML = 'Lütfen üniversitenin kısa adını girin.';

      if (!type || !type.trim().length)
        return error.innerHTML = 'Lütfen üniversitenin tipini seçin.';

      if (!rector || !rector.trim().length)
        return error.innerHTML = 'Lütfen üniversitenin rektörünü girin.';

      if (!logo || !logo.trim().length)
        return error.innerHTML = 'Lütfen üniversitenin logosunu yükleyin.';

      if (!city || !cities.includes(city))
        return error.innerHTML = 'Lütfen üniversitenin şehrini seçin.';

      serverRequest('/settings/university', 'POST', {
        short_name: shortName,
        type,
        logo,
        city,
        rector
      }, res => {
        if (!res.success)
          return error.innerHTML = 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        
        return window.location = '/settings/university';
      });
    }
  });
});
