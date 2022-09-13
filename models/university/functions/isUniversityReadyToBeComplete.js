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

  if (university.type == 'public') {
    if (!university.health_culture_and_sport_department_president || !university.health_culture_and_sport_department_president.length)
      return callback(null, false);
    if (!university.sport_high_education_president || !university.sport_high_education_president.length)
      return callback(null, false);

    return callback(null, true);
  } else if (university.type == 'private') {
    if (!university.health_culture_and_sport_department_president || !university.health_culture_and_sport_department_president.length)
      return callback(null, false);

    return callback(null, true);
  } else {
    return callback('bad_request');
  }
}
