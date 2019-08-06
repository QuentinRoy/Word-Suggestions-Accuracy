import { totalCommonCharFromStart, isUpperCase } from "./strings";

describe("totalCommonCharFromStart", () => {
  test("two similar strings", () => {
    expect(totalCommonCharFromStart("123456789", "123456789")).toBe(9);
  });

  test("shorter similar strings", () => {
    expect(totalCommonCharFromStart("123456789", "1234")).toBe(4);
    expect(totalCommonCharFromStart("1234", "123456789")).toBe(4);
  });

  test("partially different strings", () => {
    expect(totalCommonCharFromStart("aaaaaaa", "aaab")).toBe(3);
    expect(totalCommonCharFromStart("aaab", "aaaaaaa")).toBe(3);
  });

  test("completely different strings", () => {
    expect(totalCommonCharFromStart("aaaaaaa", "baaa")).toBe(0);
    expect(totalCommonCharFromStart("baaa", "aaaaaaa")).toBe(0);
  });

  test("empty strings", () => {
    expect(totalCommonCharFromStart("", "")).toBe(0);
    expect(totalCommonCharFromStart("", "")).toBe(0);
    expect(totalCommonCharFromStart("aaaaaaa", "")).toBe(0);
    expect(totalCommonCharFromStart("", "aaaaaaa")).toBe(0);
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
