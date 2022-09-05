module.exports = (university, callback) => {
  if (!university || !university._id)
    return callback('document_not_found');

  return callback(null, {
    _id: university._id.toString(),
    is_cyprus_university: university.is_cyprus_university,
    name: university.name,
    is_completed: university.is_completed,
    type: university.type,
    logo: university.logo,
    short_name: university.short_name,
    city: university.city,
    rector: university.rector
  });
}
