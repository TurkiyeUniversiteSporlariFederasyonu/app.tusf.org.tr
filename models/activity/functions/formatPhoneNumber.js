const validator = require('validator');

module.exports = number => {
  if (!number || typeof number != 'string')
    return null;

  number = number.split(' ').filter(each => each.length && !isNaN(parseInt(each))).join('');
  
  if (number[0] != '0')
    number = '0' + number;

  if (number.length != 11)
    return null;

  if (!validator.isMobilePhone(number))
    return null;

  number = number.substring(0, 4) + ' ' + number.substring(4, 7) + ' ' + number.substring(7, 9) + ' ' + number.substring(9, 11);

  return number;
}
