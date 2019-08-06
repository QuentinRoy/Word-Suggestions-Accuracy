export const sum = list => list.reduce((r, x) => r + x);

export const mean = list => sum(list) / list.length;

export const sd = (lst, lstMean = mean(lst)) => {
  const squareDiffs = lst.map(x => (x - lstMean) ** 2);
  return Math.sqrt(sum(squareDiffs) / lst.length);
};

export const count = (lst, predicate) =>
  lst.reduce((c, x, i) => (predicate(x, i) ? c + 1 : c), 0);

export const sliceIf = (lst, start, n, predicate) => {
  const result = [];
  for (let i = start; i < lst.length && result.length < n; i += 1) {
    if (predicate(lst[i], i)) result.push(lst[i]);
  }
  return result;
};
