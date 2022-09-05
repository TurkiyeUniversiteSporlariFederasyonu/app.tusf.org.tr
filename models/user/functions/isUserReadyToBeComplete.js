module.exports = (user, callback) => {
  if (!user.name || !user.name.length)
    return callback(null, false);
  if (!user.phone_number || !user.phone_number.length)
    return callback(null, false);
  if (!user.title || !user.title.length)
    return callback(null, false);
  if (!user.id_number || !user.id_number.length)
    return callback(null, false);

  return callback(null, true);
}
