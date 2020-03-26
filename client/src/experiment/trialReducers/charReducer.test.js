import charReducer from "./charReducer";
import { Actions } from "../../common/constants";

describe("charReducer", () => {
  test("adds a character to the input on input char actions", () => {
    const inputState = { input: "inpu", some: "prop to keep" };
    const action = { type: Actions.inputChar, char: "t" };
    const outputState = { input: "input", some: "prop to keep" };
    expect(charReducer(inputState, action)).toEqual(outputState);
  });

  test("removes the last character of the input on delete char actions", () => {
    const inputState = { input: "input", some: "prop to keep" };
    const action = { type: Actions.deleteChar };
    const outputState = { input: "inpu", some: "prop to keep" };
    expect(charReducer(inputState, action)).toEqual(outputState);
  });

  test("returns the state on delete char actions if the input is empty", () => {
    const inputState = { input: "" };
    const action = { type: Actions.deleteChar };
    expect(charReducer(inputState, action)).toBe(inputState);
  });

  test("returns the state on unknown actions", () => {
    const inputState = {};
    const action = { type: "UNKNOWN_ACTION" };
    expect(charReducer(inputState, action)).toBe(inputState);
  });
});
