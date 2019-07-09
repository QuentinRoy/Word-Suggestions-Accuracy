export const sum = list => list.reduce((r, x) => r + x);

export const mean = list => sum(list) / list.length;

export const sd = (lst, lstMean = mean(lst)) => {
  const squareDiffs = lst.map(x => (x - lstMean) ** 2);
  return Math.sqrt(sum(squareDiffs) / lst.length);
};
