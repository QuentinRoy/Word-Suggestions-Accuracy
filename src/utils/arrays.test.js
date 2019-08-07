import { sliceIf } from "./arrays";

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
