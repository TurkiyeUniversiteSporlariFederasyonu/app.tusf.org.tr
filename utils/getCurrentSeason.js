const SEASON_CHANGE_MONTH = 8; // September

module.exports = () => {
  const curr_year = (new Date()).getFullYear();
  const curr_month = (new Date()).getMonth();

  if (curr_month >= SEASON_CHANGE_MONTH)
    return curr_year + ' - ' + (curr_year + 1);
  else
    return (curr_year - 1) + ' - ' + curr_year;
}
