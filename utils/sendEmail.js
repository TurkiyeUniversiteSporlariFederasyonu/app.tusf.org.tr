const fetch = require('node-fetch');
const validator = require('validator');

module.exports = (data, callback) => {
  const ELASTIC_EMAIL_API_KEY = process.env.ELASTIC_EMAIL_API_KEY;

  if (!data || typeof data != 'object')
    return callback('bad_request');
  if (!data.template || typeof data.template != 'string')
    return callback('bad_request');
  if (!data.to || typeof data.to != 'string' || !validator.isEmail(data.to))
    return callback('bad_request');

  if (data.template == 'user_password_reset') {
    if (!data._id || !validator.isMongoId(data._id.toString()))
      return callback('bad_request');
    if (!data.email || typeof data.email != 'string' || !validator.isEmail(data.email))
      return callback('bad_request');
    if (!data.name || typeof data.name != 'string' || !data.name.trim().length)
      return callback('bad_request');
    if (!data.token || typeof data.token != 'string' || !data.token.trim().length)
      return callback('bad_request');

    fetch(`https://api.elasticemail.com/v2/email/send?apiKey=${ELASTIC_EMAIL_API_KEY}&isTransactional=true&template=user_password_reset&merge_id=${data._id.trim()}&merge_email=${data.email.trim()}&merge_name=${data.name.trim()}&merge_token=${data.token.trim()}&to=${data.to.trim()}&charset=utf-8`, {
      method: 'POST'
    })
      .then(data => data.json())
      .then(res => callback(null, res))
      .catch(err => {console.log(err);callback('database_error')});
  } else {
    return callback('bad_request');
  }
}
