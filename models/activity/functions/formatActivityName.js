const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const gender_names = {
  male: 'Erkek',
  female: 'Kadın',
  mix: 'Karma'
};
const type_values = ['1. Lig', '2. Lig', 'Grup Müsabakaları', 'Klasman Ligi', 'Playoff', 'Süper Lige Yükselme', 'Süperlig', 'Şenlik', 'Turnuva', 'Türkiye Kupası', 'Türkiye Şampiyonası', 'Kış Spor Oyunları Seçme Müsabakaları'];
const stage_values = ['1. Etap', '2. Etap', '3. Etap', '4. Etap', 'ÜNİLİG', 'ÜNİLİG Finalleri', 'Fetih Sporfest', 'GNÇ Sporfest'];

module.exports = data => {
  if (!data || typeof data != 'object')
    return null;

  if (!data.season || typeof data.season != 'string' || !data.season.trim().length || data.season.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return null;

  if (!data.branch_name || typeof data.branch_name != 'string' || !data.branch_name.trim().length || !data.branch_name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return null;

  if (!data.type || !type_values.includes(data.type))
    return null;

  if (!data.stage || !stage_values.includes(data.stage))
    return null;

  if (!data.university_name || typeof data.university_name != 'string' || !data.university_name.trim().length || data.university_name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return null;

  if (!data.gender || !gender_names[data.gender.toString()])
    return null;

  return data.season.trim() + ' ' + data.branch_name.trim() + ' ' + data.type.trim() + ' ' +  data.stage.trim() + ' ' + data.university_name.trim() + ' ' + gender_names[data.gender.toString()];
}
