window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.id == 'save-button') {
      const error = document.getElementById('error');
      error.innerHTML = '';

      const branchNodes = document.getElementById('branches-input').querySelectorAll('.general-checked-input-item-selected');
      const branchIdList = [];

      for (let i = 0; i < branchNodes.length; i++)
        branchIdList.push(branchNodes[i].id.replace('checked-input-', ''));

      serverRequest('/participation', 'POST', {
        branch_id_list: branchIdList
      }, res => {
        if (!res.success)
          return error.innerHTML = 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        
        return window.location = '/participation';
      });
    }
  });
});
