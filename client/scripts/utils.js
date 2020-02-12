module.exports.mapGetSetDefault = function mapGetSetDefault(
  map,
  id,
  defaultValue
) {
  const value = map[id];
  if (value === undefined) {
    // eslint-disable-next-line no-param-reassign
    map[id] = defaultValue;
    return defaultValue;
  }
  return value;
};
