import { totalCommonCharFromStart } from "./strings";

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
