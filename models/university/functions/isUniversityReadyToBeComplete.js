module.exports = (university, callback) => {
  if (!university || typeof university != 'object')
    return callback('bad_request');

  if (!university.type || !university.type.length)
    return callback(null, false);
  if (!university.logo || !university.logo.length)
    return callback(null, false);
  if (!university.short_name || !university.short_name.length)
    return callback(null, false);
  if (!university.city || !university.city.length)
    return callback(null, false);
  if (!university.rector || !university.rector.length)
    return callback(null, false);
    
  return callback(null, true);
}
