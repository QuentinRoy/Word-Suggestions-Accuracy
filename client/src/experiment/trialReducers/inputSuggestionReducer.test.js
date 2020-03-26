import { Actions } from "../../common/constants";
import inputSuggestionReducer from "./inputSuggestionReducer";

describe("inputSuggestionReducer", () => {
  test("replaces on going word", () => {
    const inputState = { input: "this ongoing wor", some: "prop to keep" };
    const action = { type: Actions.inputSuggestion, word: "word " };
    const outputState = { input: "this ongoing word ", some: "prop to keep" };
    expect(inputSuggestionReducer(inputState, action)).toEqual(outputState);
  });

  test("adds the word if input is empty", () => {
    const inputState = { input: "", some: "prop to keep" };
    const action = { type: Actions.inputSuggestion, word: "word " };
    const outputState = { input: "word ", some: "prop to keep" };
    expect(inputSuggestionReducer(inputState, action)).toEqual(outputState);
  });

  test("continues if the last char is a white space", () => {
    const inputState = { input: "this sentence is ", some: "prop to keep" };
    const action = { type: Actions.inputSuggestion, word: "finished " };
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
