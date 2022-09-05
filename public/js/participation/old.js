window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (ancestorWithClassName(event.target, 'view-participation-button')) {
      const target = ancestorWithClassName(event.target, 'view-participation-button');
      const id = target.parentNode.id;

      window.location = '/participation/details?season=' + id;
    }
  }); 
});
