import {
  totalMatchedCharsFromStart,
  totalMatchedChars,
  isUpperCase,
  trimEnd,
  trimStart
} from "./strings";

describe("totalMatchedCharsFromStart", () => {
  test("two similar strings", () => {
    expect(totalMatchedCharsFromStart("123456789", "123456789")).toBe(9);
  });

  test("shorter similar strings", () => {
    expect(totalMatchedCharsFromStart("123456789", "1234")).toBe(4);
    expect(totalMatchedCharsFromStart("1234", "123456789")).toBe(4);
  });

  test("partially different strings", () => {
    expect(totalMatchedCharsFromStart("aaaaaaa", "aaab")).toBe(3);
    expect(totalMatchedCharsFromStart("aaab", "aaaaaaa")).toBe(3);
  });

  test("strings that starts differently", () => {
    expect(totalMatchedCharsFromStart("aaaaaaa", "baaa")).toBe(0);
    expect(totalMatchedCharsFromStart("baaa", "aaaaaaa")).toBe(0);
  });

  test("empty strings", () => {
    expect(totalMatchedCharsFromStart("", "")).toBe(0);
    expect(totalMatchedCharsFromStart("", "")).toBe(0);
    expect(totalMatchedCharsFromStart("aaaaaaa", "")).toBe(0);
    expect(totalMatchedCharsFromStart("", "aaaaaaa")).toBe(0);
  });
});

describe("totalMatchedChars", () => {
  test("two similar strings", () => {
    expect(totalMatchedChars("123456789", "123456789")).toBe(9);
  });

  test("shorter similar strings", () => {
    expect(totalMatchedChars("123456789", "1234")).toBe(4);
    expect(totalMatchedChars("1234", "123456789")).toBe(4);
  });

  test("partially different strings", () => {
    expect(totalMatchedChars("aaaaaaa", "aaab")).toBe(3);
    expect(totalMatchedChars("aaab", "aaaaaaa")).toBe(3);
  });

  test("strings that starts differently", () => {
    expect(totalMatchedChars("aaaaaaa", "baaa")).toBe(3);
    expect(totalMatchedChars("baaa", "aaaaaaa")).toBe(3);
  });

  test("strings with some chars similar, some not", () => {
    expect(totalMatchedChars("123456789abcd", "--34-6-8-")).toBe(4);
  });

  test("shifted strings", () => {
    expect(totalMatchedChars("123456789", "234567891")).toBe(0);
  });

  test("empty strings", () => {
    expect(totalMatchedChars("", "")).toBe(0);
    expect(totalMatchedChars("", "")).toBe(0);
    expect(totalMatchedChars("aaaaaaa", "")).toBe(0);
    expect(totalMatchedChars("", "aaaaaaa")).toBe(0);
  });
});

describe("isUpperCase", () => {
  test("returns true if the string is entirely uppercase", () => {
    expect(isUpperCase("HELLO")).toBe(true);
  });

  test("returns true if the string is empty", () => {
    expect(isUpperCase("")).toBe(true);
  });

  test("returns false if the string is entirely lower case", () => {
    expect(isUpperCase("hello")).toBe(false);
  });

  test("returns false if there are lower case characters in the string", () => {
    expect(isUpperCase("HEllo")).toBe(false);
  });

  test("returns true if there are only upper case letters and numbers", () => {
    expect(isUpperCase("HELLO123")).toBe(true);
  });

  test("returns true if there are only upper case letters and spaces", () => {
    expect(isUpperCase("HELLO YOU")).toBe(true);
  });

  test("returns true if there are only upper case letters and special characters", () => {
    expect(isUpperCase("(HELLO$%*)")).toBe(true);
  });
});

test("trimEnd", () => {
  expect(trimEnd("hello there")).toBe("hello there");
  expect(trimEnd("hello there   ")).toBe("hello there");
  expect(trimEnd("   hello there")).toBe("   hello there");
  expect(trimEnd("   hello there   ")).toBe("   hello there");
});

test("trimStart", () => {
  expect(trimStart("hello there")).toBe("hello there");
  expect(trimStart("hello there   ")).toBe("hello there   ");
  expect(trimStart("   hello there")).toBe("hello there");
  expect(trimStart("   hello there   ")).toBe("hello there   ");
});
