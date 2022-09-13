window.addEventListener('load', () => {
  document.addEventListener('mouseover', event => {
    if (ancestorWithClassName(event.target, 'each-all-header-menu-wrapper')) {
      const target = ancestorWithClassName(event.target, 'each-all-header-menu-wrapper');

      if (document.querySelector('.each-all-header-menu-wrapper-opened')) {
        if (document.querySelector('.each-all-header-menu-wrapper-opened') == target)
          return;

        document.querySelector('.each-all-header-menu-wrapper-opened').classList.remove('each-all-header-menu-wrapper-opened');
      }

      target.classList.add('each-all-header-menu-wrapper-opened');
    } else if (document.querySelector('.each-all-header-menu-wrapper-opened')) {
      document.querySelector('.each-all-header-menu-wrapper-opened').classList.remove('each-all-header-menu-wrapper-opened');
    }
  });

  document.addEventListener('click', event => {
    if (ancestorWithClassName(event.target, 'responsive-header-open-menu-button')) {
      if (document.querySelector('.all-header-menu-wrapper-responsive-outer-wrapper').style.display == 'none') {
        document.querySelector('.all-header-menu-wrapper-responsive-outer-wrapper').style.display = 'flex';
      } else {
        document.querySelector('.all-header-menu-wrapper-responsive-outer-wrapper').style.display = 'none';
      }
    }

    if (ancestorWithClassName(event.target, 'each-all-header-menu-title-wrapper-responsive')) {
      const target = ancestorWithClassName(event.target, 'each-all-header-menu-title-wrapper-responsive');

      if (document.querySelector('.each-all-header-menu-opened'))
        document.querySelector('.each-all-header-menu-opened').classList.remove('each-all-header-menu-opened');

      target.nextElementSibling.classList.add('each-all-header-menu-opened');
    }
  })
});
