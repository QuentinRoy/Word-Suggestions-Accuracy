import { sliceIf, insertEject } from "./arrays";

describe("sliceIf", () => {
  test("returns a slice if predicates always return true", () => {
    expect(sliceIf([1, 2, 3, 4, 5], 1, 2, () => true)).toEqual([2, 3]);
  });

  test("returns an empty list if predicates always return false", () => {
    expect(sliceIf([1, 2, 3, 4, 5], 1, 2, () => false)).toEqual([]);
  });

  test("returns a slice of the expected size with items from lst that pass predicate", () => {
    expect(
      sliceIf(["a1", "a2", "b3", "a4", "b5", "a6", "a7", "a8"], 1, 4, w =>
        w.startsWith("a")
      )
    ).toEqual(["a2", "a4", "a6", "a7"]);
  });

  test("returns a slice smaller than the expected size if not enough items of lst pass predicate", () => {
    expect(
      sliceIf(["a1", "a2", "b3", "b4", "b5", "a6", "b7", "a8"], 1, 4, w =>
        w.startsWith("a")
      )
    ).toEqual(["a2", "a6", "a8"]);
  });
});

describe("insertEject", () => {
  it("does not insert the word if its score is smallest than any other score in the list", () => {
    const topWords = [
      { word: "a", score: 15 },
      { word: "b", score: 10 },
      { word: "c", score: 5 }
    ];
    const wordToInsert = { word: "x", score: 0 };
    const expected = [...topWords];
    insertEject(topWords, wordToInsert, x => x.score);
    expect(topWords).toEqual(expected);
  });

  it("replaces the last word if its score is only bigger than the last one", () => {
    const topWords = [
      { word: "a", score: 15 },
      { word: "b", score: 10 },
      { word: "c", score: 0 }
    ];
    const wordToInsert = { word: "x", score: 5 };
    const expected = [
      { word: "a", score: 15 },
      { word: "b", score: 10 },
      { word: "x", score: 5 }
    ];
    insertEject(topWords, wordToInsert, x => x.score);
    expect(topWords).toEqual(expected);
  });

  it("gets to the first position and eject the last one if its score is bigger than any other", () => {
    const topWords = [
      { word: "a", score: 15 },
      { word: "b", score: 10 },
      { word: "c", score: 5 }
    ];
    const wordToInsert = { word: "x", score: 20 };
    const expected = [
      { word: "x", score: 20 },
      { word: "a", score: 15 },
      { word: "b", score: 10 }
    ];
    insertEject(topWords, wordToInsert, x => x.score);
    expect(topWords).toEqual(expected);
  });

  it("gets to the expected position, and eject the last word if it scores is bigger than some", () => {
    const topWords = [
      { word: "a", score: 5 },
      { word: "b", score: 4 },
      { word: "c", score: 2 },
      { word: "d", score: 1 },
      { word: "e", score: 0 }
    ];
    const wordToInsert = { word: "x", score: 3 };
    const expected = [
      { word: "a", score: 5 },
      { word: "b", score: 4 },
      { word: "x", score: 3 },
      { word: "c", score: 2 },
      { word: "d", score: 1 }
    ];
    insertEject(topWords, wordToInsert, x => x.score);
    expect(topWords).toEqual(expected);
  });
});
