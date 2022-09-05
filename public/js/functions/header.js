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
  })
})
