let cities;

window.addEventListener('load', () => {
  cities = JSON.parse(document.getElementById('cities').value);

  document.addEventListener('click', event => {
    if (event.target.classList.contains('select-each-university-type-option')) {
      const type = event.target.id.replace('select-input-', '');

      if (type == 'private') {
        document.querySelector('.public-university-settings-wrapper').style.display = 'none';
        document.querySelector('.private-university-settings-wrapper').style.display = 'flex';
      } else {
        document.querySelector('.public-university-settings-wrapper').style.display = 'flex';
        document.querySelector('.private-university-settings-wrapper').style.display = 'none';
      }
    }
    
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

      const healthCultureAndSportDepartmentPresident = type == 'public' ? document.getElementById('public-health-culture-and-sport-department-president-input').value : document.getElementById('private-health-culture-and-sport-department-president-input').value;
      const sportSciencesDean = type == 'public' ? document.getElementById('public-sport-sciences-dean-input').value : document.getElementById('private-sport-sciences-dean-input').value;
      const sportHighEducationPresident = type == 'public' ? document.getElementById('public-sport-high-education-president-input').value : null;

      if (!healthCultureAndSportDepartmentPresident || !healthCultureAndSportDepartmentPresident.trim().length)
        return error.innerHTML = 'Lütfen Üniversite Sağlık, Kültür ve Spor Daire Başkanlığını yazın.';

      if (type == 'public' && (!sportHighEducationPresident || !sportHighEducationPresident.trim().length))
        return error.innerHTML = 'Lütfen Üniversite Beden Eğitimi ve Yüksekokul Müdürlüğünü yazın.';

      serverRequest('/settings/university', 'POST', {
        short_name: shortName,
        type,
        logo,
        city,
        rector,
        health_culture_and_sport_department_president: healthCultureAndSportDepartmentPresident,
        sport_sciences_dean: sportSciencesDean,
        sport_high_education_president: sportHighEducationPresident
      }, res => {
        if (!res.success)
          return error.innerHTML = 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        
        return window.location = '/settings/university';
      });
    }
  });

  const typeInput = document.getElementById('type-input');

  document.addEventListener('input', event => {
    if (event.target.id == 'type-search-input') {
      if (typeInput.value && typeInput.value == 'private') {
        document.querySelector('.public-university-settings-wrapper').style.display = 'none';
        document.querySelector('.private-university-settings-wrapper').style.display = 'flex';
      } else {
        document.querySelector('.public-university-settings-wrapper').style.display = 'flex';
        document.querySelector('.private-university-settings-wrapper').style.display = 'none';
      }
    }
  })
});
