export const totalMatchedCharsFromStart = (str1, str2) => {
  const n = Math.min(str1.length, str2.length);
  for (let i = 0; i < n; i += 1) {
    if (str1[i] !== str2[i]) return i;
  }
  return n;
};

export const totalMatchedChars = (str1, str2) => {
  const n = Math.min(str1.length, str2.length);
  let count = 0;
  for (let i = 0; i < n; i += 1) {
    if (str1[i] === str2[i]) count += 1;
  }
  return count;
};

export const isUpperCase = str => str === str.toUpperCase();
