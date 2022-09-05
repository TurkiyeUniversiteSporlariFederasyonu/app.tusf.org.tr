const bcrypt = require('bcryptjs');

module.exports = function (password, password2, callback) {
  bcrypt.compare(password, password2, (err, res) => {
    if (err || !res) return callback(false);
    else return callback(true);
  });
};
