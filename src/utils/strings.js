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

// This is an implementation of trim end for browsers that do not implement it.
// It is obviously slower than any native approach.
export const nonNativeTrimEnd = str => {
  const trimmed = str.trim();
  const start = str.indexOf(trimmed);
  return str.slice(start, str.length);
};

export const trimEnd =
  // eslint-disable-next-line no-nested-ternary
  String.prototype.trimEnd != null
    ? str => str.trimEnd()
    : String.prototype.trimRight != null
    ? str => str.trimRight()
    : nonNativeTrimEnd;
