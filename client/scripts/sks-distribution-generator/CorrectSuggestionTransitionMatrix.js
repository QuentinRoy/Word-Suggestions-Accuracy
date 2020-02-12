const { camelCase } = require("lodash");
const { parse } = require("papaparse");
const { mapGetSetDefault } = require("../utils");

const areAlmostEqual = (x, y, tolerance = 0.00001) =>
  Math.abs(x - y) < tolerance;

function CorrectSuggestionTransitionMatrix(data) {
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

  Object.entries(map).forEach(([wordLength, wordLengthMatrix]) => {
    Object.entries(wordLengthMatrix).forEach(
      ([startPos, startPosTransitions]) => {
        const sumOfPs = Object.values(startPosTransitions).reduce(
          (sum, x) => sum + x
        );
        if (!areAlmostEqual(sumOfPs, 1)) {
          throw new Error(
            `The matrix is ill-formed: for words of size ${wordLength} and prev position ${startPos}, the sum of the transition probabilities is not 1.`
          );
        }
      }
    );
  });

  return {
    pickNext({ wordLength, currentPosition, seed = Math.random() }) {
      const wordLengthMatrix = map[wordLength];
      if (wordLengthMatrix == null) {
        throw new Error(
          `The matrix does not support words of length ${wordLength}.`
        );
      }
      const matrix = wordLengthMatrix[currentPosition];
      if (matrix == null) {
        throw new Error(
          `The matrix does not support transitions from ${currentPosition} for word of length ${wordLength}.`
        );
      }
      const entries = Object.entries(matrix);
      let cumulativeProb = 0;
      for (let i = 0; i < entries.length; i += 1) {
        const [pos, p] = entries[i];
        cumulativeProb += p;
        if (cumulativeProb > seed) {
          return Number.isNaN(+pos) ? null : +pos;
        }
      }
      throw new Error(
        `No next position found for words of length ${wordLength} and current position ${currentPosition} with seed ${seed}. Is the matrix ill formed?`
      );
    }
  };
}

CorrectSuggestionTransitionMatrix.parse = function parseTransitionMatrix(path) {
  return new Promise((resolve, reject) => {
    parse(path, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: camelCase,
      transform(value) {
        const numValue = +value;
        return Number.isNaN(numValue) ? null : numValue;
      },
      complete(results) {
        resolve(CorrectSuggestionTransitionMatrix(results.data));
      },
      error(error) {
        reject(error);
      }
    });
  });
};

module.exports = CorrectSuggestionTransitionMatrix;
