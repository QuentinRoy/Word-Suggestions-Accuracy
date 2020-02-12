const range = require('lodash/range');

const balancedLatinSquareOfSize = n => {
  if (n < 2) return range(0, n);
  const firstRow = [
    0,
    1,
    ...range(2, n).map(i => Math.floor(i % 2 === 0 ? n - i / 2 : i / 2 + 1))
  ];
  const latinSquare = range(1, n).reduce(
    result => {
      const prevRow = result[result.length - 1];
      const newRow = prevRow.map(prevRowJ => (prevRowJ + 1) % n);
      return [...result, newRow];
    },
    [firstRow]
  );

  // In case there is an odd number of treatments, we also need to add the
  // reversed rows.
  if (n % 2 > 0) {
    return [...latinSquare, ...latinSquare.map(row => [...row].reverse())];
  }
  return latinSquare;
};

const balancedLatinSquare = values => {
  const latinSquareIndexes = balancedLatinSquareOfSize(values.length);
  return latinSquareIndexes.map(row => row.map(i => values[i]));
};

const getPermutations = values =>
  values.length === 1
    ? [values]
    : values
        .map((v, i) =>
          getPermutations([
            ...values.slice(0, Math.max(0, i)),
            ...values.slice(i + 1)
          ]).map(p => [v, ...p])
        )
        .reduce((res, list) => [...res, ...list], []);

const fullCounterbalancing = values => getPermutations(values);

module.exports = { balancedLatinSquare, fullCounterbalancing };
