const TransitionMatrix = require("./CorrectSuggestionTransitionMatrix");

describe("CorrectSuggestionTransitionMatrix", () => {
  test("pickNext", () => {
    const tm = TransitionMatrix([
      { wordLength: 2, prevPosition: 1, newPosition: 1, p: 1 },
      { wordLength: 2, prevPosition: 1, newPosition: 2, p: 0 },
      { wordLength: 2, prevPosition: 2, newPosition: 1, p: 0.7 },
      { wordLength: 2, prevPosition: 2, newPosition: 2, p: 0.3 },
      { wordLength: 2, prevPosition: null, newPosition: 1, p: 0.5 },
      { wordLength: 2, prevPosition: null, newPosition: 2, p: 0.5 }
    ]);

    const wordLength = 2;

    // Transition from 1.
    let currentPosition = 1;
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0 })).toBe(1);
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0.99999 })).toBe(1);
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0.5 })).toBe(1);

    // Transition from 2.
    currentPosition = 2;
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0 })).toBe(1);
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0.99999 })).toBe(2);
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0.5 })).toBe(1);
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0.7 })).toBe(2);

    // Transition from null.
    currentPosition = null;
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0 })).toBe(1);
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0.99999 })).toBe(2);
    expect(tm.pickNext({ wordLength, currentPosition, seed: 0.5 })).toBe(2);
  });

  test("check that the matrix is valid", () => {
    expect(() =>
      TransitionMatrix([
        { wordLength: 2, prevPosition: 1, newPosition: 1, p: 1 },
        { wordLength: 2, prevPosition: 1, newPosition: 2, p: 0 },
        { wordLength: 2, prevPosition: 2, newPosition: 2, p: 0.3 }
      ])
    ).toThrow(
      "The matrix is ill-formed: for words of size 2 and prev position 2, the sum of the transition probabilities is not 1."
    );
  });

  test("provides meaningful errors when the matrix does not support the requested transition", () => {
    const tm = TransitionMatrix([
      { wordLength: 2, prevPosition: 1, newPosition: 1, p: 1 },
      { wordLength: 2, prevPosition: 1, newPosition: 2, p: 0 }
    ]);
    expect(() => tm.pickNext({ wordLength: 1, currentPosition: 1 })).toThrow(
      "The matrix does not support words of length 1."
    );
    expect(() => tm.pickNext({ wordLength: 2, currentPosition: 3 })).toThrow(
      "The matrix does not support transitions from 3 for word of length 2."
    );
  });
});
