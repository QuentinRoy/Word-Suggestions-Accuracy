import { parse } from "papaparse";
import camelCase from "lodash/camelCase";
import { mapGetSetDefault } from "../../utils/map";

export default function TransitionMatrix(data) {
  const map = {};
  for (let i = 0; i < data.length; i += 1) {
    const row = data[i];
    const wordLengthMap = mapGetSetDefault(map, row.wordLength, {});
    const prevPositionMap = mapGetSetDefault(
      wordLengthMap,
      row.prevPosition,
      {}
    );
    prevPositionMap[row.newPosition] = row.p;
  }

  return {
    pickNext({ wordLength, currentPosition, seed = Math.random }) {
      const matrix = map[wordLength][currentPosition];
      const entries = Object.entries(matrix);
      let cumulativeProb = 0;
      for (let i = 0; i < entries.length; i += 1) {
        const [pos, p] = entries[i];
        cumulativeProb += p;
        if (cumulativeProb > seed) {
          return Number.isNaN(+pos) ? null : +pos;
        }
      }
      throw new Error(`No next position found. Is the matrix ill formed?`);
    }
  };
}

TransitionMatrix.fetch = function fetchTransitionMatrix(path) {
  return new Promise((resolve, reject) => {
    parse(path, {
      download: true,
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: camelCase,
      transform(value) {
        const numValue = +value;
        return Number.isNaN(numValue) ? null : numValue;
      },
      complete(results) {
        resolve(TransitionMatrix(results.data));
      },
      error(error) {
        reject(error);
      }
    });
  });
};
