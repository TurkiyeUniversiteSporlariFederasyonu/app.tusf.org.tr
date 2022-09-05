module.exports = password_length => {
  let pasword = '';
  let hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

  for (let i = 0; i < password_length; i++)
    pasword += hexChars[Math.floor(Math.random() * 16)];

  return pasword;
}
