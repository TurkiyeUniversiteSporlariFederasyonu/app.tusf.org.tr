function uploadImage (file, callback) {
  const formdata = new FormData();
  formdata.append('file', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/image/upload');
  xhr.send(formdata);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.responseText) {
      const res = JSON.parse(xhr.responseText);

      if (!res.success)
        return callback(res.error || 'unknown_error');

      return callback(null, res.url);
    }
  };
}

function createImagePicker (wrapper) {
  const settingsImagePicker = document.createElement('label');
  settingsImagePicker.classList.add('general-choose-image-input-text');

  const span = document.createElement('span');
  span.innerHTML = 'Bilgisayarınızdan seçmek için tıklayın.';
  settingsImagePicker.appendChild(span);

  const input = document.createElement('input');
  input.classList.add('display-none');
  input.classList.add('general-image-input');
  input.accept = 'image/*';
  input.type = 'file';

  settingsImagePicker.appendChild(input);

  wrapper.innerHTML = '';
  wrapper.appendChild(settingsImagePicker);
}

function createUploadedImage (url, wrapper) {
  const imageInputWrapper = document.createElement('div');
  imageInputWrapper.classList.add('general-image-input-wrapper');

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('general-image-input-wrapper-image');
  const image = document.createElement('img');
  image.src = url;
  imageWrapper.appendChild(image);
  imageInputWrapper.appendChild(imageWrapper);

  const i = document.createElement('i');
  i.classList.add('fas');
  i.classList.add('fa-times');
  i.classList.add('general-delete-image-button');
  imageInputWrapper.appendChild(i);

  wrapper.innerHTML = '';
  wrapper.appendChild(imageInputWrapper);
}

function createCustomInputItem (value, wrapper) {
  const eachItem = document.createElement('div');
  eachItem.classList.add('each-general-custom-input-item-wrapper');

  const eachItemText = document.createElement('div');
  eachItemText.classList.add('each-general-custom-input-item-text');
  eachItemText.innerHTML = value;
  eachItem.appendChild(eachItemText);

  const eachItemIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  eachItemIcon.classList.add('each-general-custom-input-item-icon');
  eachItemIcon.setAttributeNS(null, 'width', '320');
  eachItemIcon.setAttributeNS(null, 'height', '321');
  eachItemIcon.setAttributeNS(null, 'viewBox', '0 0 320 321');
  eachItemIcon.setAttributeNS(null, 'fill', 'var(--blue)');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttributeNS(null, 'd', 'M310.6 266.4C323.1 278.9 323.1 299.15 310.6 311.65C304.4 317.9 296.2 321 288 321C279.8 321 271.62 317.875 265.38 311.625L160 206.3L54.63 311.6C48.38 317.9 40.19 321 32 321C23.81 321 15.63 317.9 9.375 311.6C-3.125 299.1 -3.125 278.85 9.375 266.35L114.775 160.95L9.375 55.6001C-3.125 43.1001 -3.125 22.8501 9.375 10.3501C21.875 -2.1499 42.125 -2.1499 54.625 10.3501L160 115.8L265.4 10.4001C277.9 -2.0999 298.15 -2.0999 310.65 10.4001C323.15 22.9001 323.15 43.1501 310.65 55.6501L205.25 161.05L310.6 266.4Z');
  eachItemIcon.appendChild(path);

  eachItem.appendChild(eachItemIcon);

  wrapper.appendChild(eachItem);
}

function createCustomInputSelectItem (value, id, wrapper) {
  const eachItem = document.createElement('div');
  eachItem.classList.add('each-general-custom-input-item-wrapper');

  const eachItemText = document.createElement('div');
  eachItemText.classList.add('each-general-custom-input-item-text');
  eachItemText.innerHTML = value;
  eachItemText.id = id;
  eachItem.appendChild(eachItemText);

  const eachItemIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  eachItemIcon.classList.add('each-general-custom-input-item-icon');
  eachItemIcon.setAttributeNS(null, 'width', '320');
  eachItemIcon.setAttributeNS(null, 'height', '321');
  eachItemIcon.setAttributeNS(null, 'viewBox', '0 0 320 321');
  eachItemIcon.setAttributeNS(null, 'fill', 'var(--blue)');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttributeNS(null, 'd', 'M310.6 266.4C323.1 278.9 323.1 299.15 310.6 311.65C304.4 317.9 296.2 321 288 321C279.8 321 271.62 317.875 265.38 311.625L160 206.3L54.63 311.6C48.38 317.9 40.19 321 32 321C23.81 321 15.63 317.9 9.375 311.6C-3.125 299.1 -3.125 278.85 9.375 266.35L114.775 160.95L9.375 55.6001C-3.125 43.1001 -3.125 22.8501 9.375 10.3501C21.875 -2.1499 42.125 -2.1499 54.625 10.3501L160 115.8L265.4 10.4001C277.9 -2.0999 298.15 -2.0999 310.65 10.4001C323.15 22.9001 323.15 43.1501 310.65 55.6501L205.25 161.05L310.6 266.4Z');
  eachItemIcon.appendChild(path);

  eachItem.appendChild(eachItemIcon);

  wrapper.appendChild(eachItem);
}

window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.classList.contains('general-checked-input-item')) {
      if (event.target.classList.contains('general-checked-input-item-selected'))
        event.target.classList.remove('general-checked-input-item-selected');
      else
        event.target.classList.add('general-checked-input-item-selected');
    }

    if (ancestorWithClassName(event.target, 'general-select-input-wrapper')) {
      const target = ancestorWithClassName(event.target, 'general-select-input-wrapper');

      if (document.querySelector('.general-select-input-wrapper-opened')) {
        if (document.querySelector('.general-select-input-wrapper-opened') != target)
          document.querySelector('.general-select-input-wrapper-opened').classList.remove('general-select-input-wrapper-opened');
      }

      target.classList.add('general-select-input-wrapper-opened');
    } else if (document.querySelector('.general-select-input-wrapper-opened')) {
      document.querySelector('.general-select-input-wrapper-opened').classList.remove('general-select-input-wrapper-opened');
    }

    if (event.target.classList.contains('general-select-input-each-option')) {
      event.target.parentNode.parentNode.querySelector('.general-select-input-value').value = event.target.id.replace('select-input-', '');
      event.target.parentNode.parentNode.querySelector('.general-select-input-search').value = event.target.innerHTML;
      event.target.parentNode.parentNode.classList.remove('general-select-input-wrapper-opened');
      if (ancestorWithClassName(event.target, 'general-custom-item-input-wrapper')) {
        const target = ancestorWithClassName(event.target, 'general-custom-item-input-wrapper');
        if (target.querySelector('.general-select-input-value').value.length)
          target.querySelector('.general-custom-input-add-button-select').classList.add('general-custom-input-add-button-select-ready');
        else
          target.querySelector('.general-custom-input-add-button-select').classList.remove('general-custom-input-add-button-select-ready');
      }
    }

    if (event.target.classList.contains('general-delete-image-button')) {
      const wrapper = event.target.parentNode.parentNode;
      const url = event.target.parentNode.childNodes[0].src;

      serverRequest(`/image/delete?url=${url}`, 'GET', {}, res => {
        if (!res.success) return throwError(res.error);

        createImagePicker(wrapper);
      });
    }

    if (ancestorWithClassName(event.target, 'general-custom-input-add-button-ready')) {
      const target = ancestorWithClassName(event.target, 'general-custom-input-add-button-ready');
      const value = target.parentNode.querySelector('.general-custom-item-input').value.trim();
      const wrapper = target.parentNode.parentNode.querySelector('.general-custom-input-items-wrapper');
      createCustomInputItem(value, wrapper);
      target.parentNode.querySelector('.general-custom-item-input').value = '';
    }

    if (ancestorWithClassName(event.target, 'general-custom-input-add-button-select-ready')) {
      const target = ancestorWithClassName(event.target, 'general-custom-input-add-button-select-ready');
      const value = target.parentNode.querySelector('.general-select-input-search').value.trim();
      const id = target.parentNode.querySelector('.general-select-input-value').value.trim();
      const wrapper = target.parentNode.parentNode.querySelector('.general-custom-input-items-wrapper');
      createCustomInputSelectItem(value, id, wrapper);
      target.classList.remove('general-custom-input-add-button-select-ready');
      target.parentNode.querySelector('.general-select-input-value').value = '';
      target.parentNode.querySelector('.general-select-input-search').value = '';
    }

    if (ancestorWithClassName(event.target, 'each-general-custom-input-item-icon')) {
      const target = ancestorWithClassName(event.target, 'each-general-custom-input-item-icon');
      target.parentNode.remove();
    }
  });

  document.addEventListener('input', event => {
    if (event.target.classList.contains('general-select-input-search')) {
      event.target.parentNode.classList.add('general-select-input-wrapper-opened');
      const nodes = event.target.parentNode.querySelector('.general-select-input-options-wrapper').children;

      event.target.parentNode.querySelector('.general-select-input-value').value = '';

      for (let i = 0; i < nodes.length; i++) {
        if (!event.target.value.length || nodes[i].innerHTML.trim().toLocaleLowerCase().includes(event.target.value.trim().toLocaleLowerCase())) {
          nodes[i].style.display = 'flex';

          if (nodes[i].innerHTML.trim().toLocaleLowerCase() == event.target.value.trim().toLocaleLowerCase())
            event.target.parentNode.querySelector('.general-select-input-value').value = nodes[i].id.replace('select-input-', '');
        } else {
          nodes[i].style.display = 'none';
        }
      }

      if (ancestorWithClassName(event.target, 'general-custom-item-input-wrapper')) {
        const target = ancestorWithClassName(event.target, 'general-custom-item-input-wrapper');
        console.log(target.querySelector('.general-select-input-value').value)
        if (target.querySelector('.general-select-input-value').value.length)
          target.querySelector('.general-custom-input-add-button-select').classList.add('general-custom-input-add-button-select-ready');
        else
          target.querySelector('.general-custom-input-add-button-select').classList.remove('general-custom-input-add-button-select-ready');
      }
    }

    if (event.target.classList.contains('general-custom-item-input')) {
      if (event.target.value && event.target.value.trim().length)
        event.target.parentNode.querySelector('.general-custom-input-add-button').classList.add('general-custom-input-add-button-ready');
      else
        event.target.parentNode.querySelector('.general-custom-input-add-button').classList.remove('general-custom-input-add-button-ready');
    }
  });

  document.addEventListener('change', event => {
    if (event.target.classList.contains('general-image-input')) {
      const file = event.target.files[0];

      event.target.parentNode.style.cursor = 'progress';
      event.target.parentNode.childNodes[0].innerHTML = 'Yükleniyor...';
      event.target.parentNode.childNodes[1].type = 'text';

      uploadImage(file, (err, url) => {
        if (err)
          return throwError(err);

        createUploadedImage(url, event.target.parentNode.parentNode);
      });
    }
  });


  document.addEventListener('keyup', event => {
    if (event.key == 'Enter' && event.target.classList.contains('general-custom-item-input') && event.target.value && event.target.value.trim().length) {
      const value = event.target.value.trim();
      const wrapper = event.target.parentNode.parentNode.querySelector('.general-custom-input-items-wrapper');
      createCustomInputItem(value, wrapper);
      event.target.value = '';
    }
  });
});
