/*
  Uses createConfirm function to show an error prompt to user
*/

function throwError(message) {
  createConfirm({
    title: 'Bir Hata Oluştu',
    text: 'İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin ya da teknik ekip ile iletişime geçin. Hata mesajı: ' + (message && message.length ? message : 'unknown_error'),
    reject: 'Kapat'
  }, res => { return; });
}
