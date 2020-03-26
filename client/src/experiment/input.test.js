import {
  isTargetCompleted,
  getTotalCorrectCharacters,
  isInputCorrect,
  getTotalIncorrectCharacters,
  getCurrentInputWord,
  getRksImprovement,
  getRemainingKeyStrokes,
  getTextFromSksDistribution,
} from "./input";

describe("isTargetCompleted", () => {
  test("returns true if the input is the same as the target", () => {
    expect(isTargetCompleted("test", "test")).toBe(true);
    expect(
      isTargetCompleted("this text is correct", "this text is correct")
    ).toBe(true);
    expect(isTargetCompleted("", "")).toBe(true);
  });
  test("returns false in other situations", () => {
    expect(isTargetCompleted("something", "something else")).toBe(false);
    expect(
      isTargetCompleted("this text is incorrect", "this text is correct")
    ).toBe(false);
    expect(
      isTargetCompleted("this has    extra spaces", "this has extra spaces")
    ).toBe(false);
    expect(isTargetCompleted("    this tooo", "this too")).toBe(false);

    expect(isTargetCompleted("test ", "test")).toBe(false);
    expect(isTargetCompleted("test     ", "test")).toBe(false);
    expect(
      isTargetCompleted("this text is correct ", "this text is correct")
    ).toBe(false);
    expect(
      isTargetCompleted("this text is correct     ", "this text is correct")
    ).toBe(false);
    expect(isTargetCompleted(" ", "")).toBe(false);
  });
});

describe("isInputCorrect", () => {
  test("returns true if there is no incorrect character", () => {
    expect(isInputCorrect("hello ", "hello there")).toBe(true);
  });

  test("returns false if there are extra white spaces at the end, and the input is completed", () => {
    expect(isInputCorrect("hello there   ", "hello there")).toBe(false);
  });

  test("returns false if there are extra white spaces at the end and the input is not completed", () => {
    expect(isInputCorrect("hell ", "hello there")).toBe(false);
    expect(isInputCorrect("hello  ", "hello there")).toBe(false);
  });

  test("returns false if there are incorrect characters", () => {
    expect(isInputCorrect("hell no", "hello there")).toBe(false);
    expect(isInputCorrect("input has 0 typo", "input has 1 typo")).toBe(false);
  });
});

describe("getTotalCorrectCharacters", () => {
  test("returns the length of the input is completed", () => {
    expect(
      getTotalCorrectCharacters("this text is correct", "this text is correct")
    ).toBe("this text is correct".length);
  });

  test("returns the length of the input if it is correct", () => {
    const input = "hello ";
    const target = "hello there";
    expect(getTotalCorrectCharacters(input, target)).toBe(input.length);
  });

  test("returns the number of matching characters at the beginning of the input otherwise", () => {
    expect(
      getTotalCorrectCharacters(
        "this is not correct",
        "this is what needs to be typed"
      )
    ).toBe("this is ".length);

    expect(
      getTotalCorrectCharacters(
        " this has an extra space at the start",
        "this has not"
      )
    ).toBe(0);

    expect(
      getTotalCorrectCharacters(
        "this has extra spaces at the end  ",
        "this has extra spaces at the end"
      )
    ).toBe("this has extra spaces at the end".length);
  });
});

describe("getTotalIncorrectCharacters", () => {
  test("returns 0 if the input is correct", () => {
    expect(getTotalIncorrectCharacters("hello ", "hello there")).toBe(0);
  });

  test("returns the number of characters including and after the first incorrect character", () => {
    expect(getTotalIncorrectCharacters("helo ", "hello there")).toBe(
      "o ".length
    );
  });
});

describe("getCurrentInputWord", () => {
  test("returns the last word, and its index, if there are no white space at the end", () => {
    expect(getCurrentInputWord("hello my friend")).toEqual({
      word: "friend",
      index: 2,
    });
  });
  test("returns an empty string and the index of the last word + 1 if there are white spaces at the end", () => {
    expect(getCurrentInputWord("hello my dear friend ")).toEqual({
      word: "",
      index: 4,
    });
  });

  test("conflate white spaces", () => {
    expect(getCurrentInputWord("  hello  my   friend")).toEqual(
      getCurrentInputWord("hello my friend")
    );
    expect(getCurrentInputWord("  hello   my  dear   friend    ")).toEqual(
      getCurrentInputWord("hello my dear friend ")
    );
  });
});

describe("getRemainingKeyStrokes", () => {
  test("returns the number of remaining characters in target if there are no errors", () => {
    expect(getRemainingKeyStrokes("hello", "hello there ")).toBe(
      " there ".length
    );
    expect(getRemainingKeyStrokes("", "hello there ")).toBe(
      "hello there ".length
    );
  });

  test("returns 0 if the target is completed", () => {
    expect(getRemainingKeyStrokes("hello there", "hello there")).toBe(0);
  });

  test("returns the number of remaining characters in target + the number of characters to remove if there are errors", () => {
    expect(getRemainingKeyStrokes("hell no", "hello there")).toBe(
      "o there".length + " no".length
    );
    expect(getRemainingKeyStrokes("completely wrong", "hello there")).toBe(
      "hello there".length + "completely wrong".length
    );
  });

  test("returns the number of extraneous characters, if the target has been exceeded", () => {
    expect(getRemainingKeyStrokes("hello there   ", "hello there")).toBe(
      "   ".length
    );
    expect(getRemainingKeyStrokes("hello there my friend", "hello there")).toBe(
      " my friend".length
    );
    expect(getRemainingKeyStrokes("hello there    a", "hello there")).toBe(
      "    a".length
    );
  });
});

describe("getRksImprovement", () => {
  test("returns the number of saved key strokes when the suggestion is correct", () => {
    expect(getRksImprovement("hello", "hello", "hello there")).toBe(0);
    expect(getRksImprovement("hel", "hello", "hello there")).toBe(2);
    expect(getRksImprovement("hel", "hello ", "hello there")).toBe(3);
    expect(getRksImprovement("hal", "hello", "hello there")).toBe(6);
    expect(getRksImprovement("forcesss", "force", "force")).toBe("sss".length);
    expect(getRksImprovement("helo the", "hello there", "hello there")).toBe(
      "lo there".length + "o the".length
    );
  });

  test("returns the number of saved key strokes when the suggestion is incorrect", () => {
    expect(getRksImprovement("hel", "hella", "hello there")).toBe(0);
    expect(getRksImprovement("hel", "hela", "hello there")).toBe(-1);
    expect(getRksImprovement("hel", "helo there", "hello there")).toBe(
      -"o there".length
    );
    expect(getRksImprovement("hell", "hell ", "hello there")).toBe(-1);
    expect(getRksImprovement("h", "hello you", "hello there")).toBe(
      "ello ".length - "you".length
    );

    expect(getRksImprovement("hel", "hello", "hello")).toBe(2);
    expect(getRksImprovement("hal", "hello", "hello")).toBe(6);
    expect(getRksImprovement("forcesss", "forces", "force")).toBe(2);
  });
});

describe("getTextFromSksDistribution", () => {
  test("returns the corresponding text", () => {
    expect(
      getTextFromSksDistribution([
        { word: "hello ", sks: 1 },
        { word: "there ", sks: 2 },
      ])
    ).toBe("hello there ");
  });
});
