module.exports = (branch, callback) => {
  if (!branch || !branch._id)
    return callback('document_not_found');

  callback(null, {
    _id: branch._id.toString(),
    name: branch.name,
    type: branch.type,
    subbranches: branch.subbranches,
    categories: branch.categories,
    gender: branch.gender,
    gold_count: branch.gold_count,
    silver_count: branch.silver_count,
    bronze_count: branch.bronze_count,
    team_min_size: branch.team_min_size,
    team_max_size: branch.team_max_size
  });
}
