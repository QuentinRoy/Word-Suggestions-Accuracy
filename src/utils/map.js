/* eslint-disable import/prefer-default-export */

export const mapGetSetDefault = (map, id, defaultValue) => {
  const value = map[id];
  if (value === undefined) {
    // eslint-disable-next-line no-param-reassign
    map[id] = defaultValue;
    return defaultValue;
  }
  return value;
};
