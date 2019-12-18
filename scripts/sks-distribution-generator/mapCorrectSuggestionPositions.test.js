const mapCorrectSuggestionPositions = require("./mapCorrectSuggestionPositions");

test("mapCorrectSuggestionPositions", () => {
  const transitionMatrix = {
    pickNext: jest
      .fn()
      // First word
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(3)
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
          null, // nothing typed
          null, // a typed
          null, // ab typed
          5, // abc typed
          3, // abcd typed
          1, // abcde typed
          1 // abecdef typed
        ]
      },
      {
        word: "abcd",
        sks: 1,
        correctSuggestionPositions: [null, null, null, 2, 2]
      },
      {
        word: "abcdefgh",
        sks: 0,
        correctSuggestionPositions: [
          null, // (nothing)
          null, // a
          null, // ab
          null, // abc
          null, // abcd
          null, // abcde
          null, // abcdef
          null, // abcdefg
          3 // abcdefgh
        ]
      }
    ]
  });
});
