const mapCorrectSuggestionPositions = require("./mapCorrectSuggestionPositions");

test("mapCorrectSuggestionPositions", () => {
  const transitionMatrix = {
    pickNext: jest
      .fn()
      // First word
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
      // Second word
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(2)
      // Third word
      .mockReturnValueOnce(3)
  };

  const result = mapCorrectSuggestionPositions(transitionMatrix, {
    foo: "bar",
    words: [
      { word: "abcdef", sks: 3 },
      { word: "abcd", sks: 1 },
      { word: "abcdefgh", sks: 0 }
    ]
  });

  expect(result).toEqual({
    foo: "bar",
    words: [
      {
        word: "abcdef",
        sks: 3,
        correctSuggestionPositions: [
          -1, // nothing typed
          -1, // a typed
          -1, // ab typed
          4, // abc typed
          -1, // abcd typed
          0, // abcde typed
          0 // abecdef typed
        ]
      },
      {
        word: "abcd",
        sks: 1,
        correctSuggestionPositions: [-1, -1, -1, 1, 1]
      },
      {
        word: "abcdefgh",
        sks: 0,
        correctSuggestionPositions: [
          -1, // (nothing)
          -1, // a
          -1, // ab
          -1, // abc
          -1, // abcd
          -1, // abcde
          -1, // abcdef
          -1, // abcdefg
          2 // abcdefgh
        ]
      }
    ]
  });
});
