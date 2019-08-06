/* eslint-disable import/prefer-default-export */

export const totalCommonCharFromStart = (str1, str2) => {
  for (let i = 0; i < str1.length; i += 1) {
    if (i >= str2.length || str1[i] !== str2[i]) return i;
  }
  return str1.length;
};
