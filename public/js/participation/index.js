window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.id == 'save-button') {
      const error = document.getElementById('error');
      error.innerHTML = '';

      const femaleBranchNodes = document.getElementById('female-branches-input').querySelectorAll('.general-checked-input-item-selected');
      const maleBranchNodes = document.getElementById('male-branches-input').querySelectorAll('.general-checked-input-item-selected');
      const femaleBranchIdList = [], maleBranchIdList = [];

      for (let i = 0; i < femaleBranchNodes.length; i++)
        femaleBranchIdList.push(femaleBranchNodes[i].id.replace('checked-input-', ''));

      for (let i = 0; i < maleBranchNodes.length; i++)
        maleBranchIdList.push(maleBranchNodes[i].id.replace('checked-input-', ''));

      serverRequest('/participation', 'POST', {
        female_branch_id_list: femaleBranchIdList,
        male_branch_id_list: maleBranchIdList
      }, res => {
        if (!res.success)
          return error.innerHTML = 'Bilinmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        
        return window.location = '/participation';
      });
    }
  });
});
