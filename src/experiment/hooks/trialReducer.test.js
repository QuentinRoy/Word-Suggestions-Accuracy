import {
  inputSuggestionReducer,
  charReducer,
  keyboardLayoutReducer
} from "./trialReducer";
import { Actions, KeyboardLayoutNames } from "../../utils/constants";

describe("inputSuggestionReducer", () => {
  test("replaces on going word", () => {
    const inputState = { input: "this ongoing wor", some: "prop to keep" };
    const action = { type: Actions.inputSuggestion, word: "word" };
    const outputState = { input: "this ongoing word ", some: "prop to keep" };
    expect(inputSuggestionReducer(inputState, action)).toEqual(outputState);
  });

  test("adds the word if input is empty", () => {
    const inputState = { input: "", some: "prop to keep" };
    const action = { type: Actions.inputSuggestion, word: "word" };
    const outputState = { input: "word ", some: "prop to keep" };
    expect(inputSuggestionReducer(inputState, action)).toEqual(outputState);
  });

  test("continues if the last char is a white space", () => {
    const inputState = { input: "this sentence is ", some: "prop to keep" };
    const action = { type: Actions.inputSuggestion, word: "finished" };
    const outputState = {
      input: "this sentence is finished ",
      some: "prop to keep"
    };
    expect(inputSuggestionReducer(inputState, action)).toEqual(outputState);
  });

  test("returns the state on unknown actions", () => {
    const inputState = {};
    const action = { type: "UNKNOWN_ACTION" };
    expect(inputSuggestionReducer(inputState, action)).toBe(inputState);
  });
});

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

describe("keyboardLayoutReducer", () => {
  test("switch to the specified layout if the current one is default", () => {
    const inputState = {
      layoutName: KeyboardLayoutNames.default,
      prop: "to keep"
    };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: "mockLayout"
    };
    const outputState = {
      layoutName: "mockLayout",
      prop: "to keep"
    };
    expect(keyboardLayoutReducer(inputState, action)).toMatchObject(
      outputState
    );
  });

  test("switch to the specified layout if the current one is another layout", () => {
    const inputState = {
      layoutName: "mockLayout1",
      prop: "to keep"
    };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: "mockLayout2"
    };
    const outputState = {
      layoutName: "mockLayout2",
      prop: "to keep"
    };
    expect(keyboardLayoutReducer(inputState, action)).toMatchObject(
      outputState
    );
  });

  test("switch back to the default layout if the current one is the one specified", () => {
    const inputState = {
      layoutName: "mockLayout",
      prop: "to keep"
    };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: "mockLayout"
    };
    const outputState = {
      layoutName: KeyboardLayoutNames.default,
      prop: "to keep"
    };
    expect(keyboardLayoutReducer(inputState, action)).toMatchObject(
      outputState
    );
  });

  test("returns the state if the current layout, and the target layout is the default one", () => {
    const inputState = { layoutName: KeyboardLayoutNames.default };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: KeyboardLayoutNames.default
    };
    expect(keyboardLayoutReducer(inputState, action)).toBe(inputState);
  });

  test("returns the state on unknown actions", () => {
    const inputState = {};
    const action = { type: "UNKNOWN_ACTION" };
    expect(keyboardLayoutReducer(inputState, action)).toBe(inputState);
  });
});

describe("focusReducer", () => {
  test("switch to the specified layout if the current one is default", () => {
    const inputState = {
      layoutName: KeyboardLayoutNames.default,
      prop: "to keep"
    };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: "mockLayout"
    };
    const outputState = {
      layoutName: "mockLayout",
      prop: "to keep"
    };
    expect(keyboardLayoutReducer(inputState, action)).toMatchObject(
      outputState
    );
  });

  test("returns the state on unknown actions", () => {
    const inputState = {};
    const action = { type: "UNKNOWN_ACTION" };
    expect(keyboardLayoutReducer(inputState, action)).toBe(inputState);
  });
});
