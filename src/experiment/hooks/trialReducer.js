import { KeyboardLayoutNames, Actions } from "../../utils/constants";

export const charReducer = (state, action) => {
  switch (action.type) {
    // Insert character.
    case Actions.inputChar:
      return { ...state, input: state.input + action.char };

    // Delete character.
    case Actions.deleteChar:
      if (state.input === "") return state;
      return { ...state, input: state.input.slice(0, -1) };

    default:
      return state;
  }
};

export const keyboardLayoutReducer = (state, action) => {
  switch (action.type) {
    // Go back to the default layout every time a character is inserted.
    case Actions.inputChar:
    case Actions.deleteChar:
    case Actions.inputSuggestion:
      return { ...state, layoutName: KeyboardLayoutNames.default };

    // Toggle the layout.
    case Actions.toggleKeyboardLayout:
      if (
        state.layoutName === KeyboardLayoutNames.default &&
        action.layoutName === KeyboardLayoutNames.default
      ) {
        return state;
      }
      if (state.layoutName === action.layoutName) {
        return {
          ...state,
          layoutName: KeyboardLayoutNames.default
        };
      }
      return { ...state, layoutName: action.layoutName };

    default:
      return state;
  }
};

export const inputSuggestionReducer = (state, action) => {
  if (action.type !== Actions.inputSuggestion) return state;
  const inputWithoutLastWord = state.input.slice(
    0,
    state.input.lastIndexOf(" ") + 1
  );
  return {
    ...state,
    input: `${inputWithoutLastWord}${action.word} `
  };
};

// Creates the main reducer, by applying each reducer one after the other.
const reducers = [charReducer, keyboardLayoutReducer, inputSuggestionReducer];
const trialReducer = (state, action) =>
  reducers.reduce((newState, reducer) => reducer(newState, action), state);

export default trialReducer;
