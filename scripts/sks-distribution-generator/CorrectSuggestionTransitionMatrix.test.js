import TransitionMatrix from "./CorrectSuggestionTransitionMatrix";

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
});
