import {
  KeyboardLayoutNames,
  Actions,
  totalSuggestions
} from "../utils/constants";

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

export const docFocusReducer = (state, action) => {
  switch (action.type) {
    case Actions.docBlurred:
      return { ...state, hasDocFocus: false };
    case Actions.docFocused:
      return { ...state, hasDocFocus: true };
    default:
      return state;
  }
};

const focusTargets = [
  "input",
  ...Array.from({ length: totalSuggestions }, (_, i) => `suggestion-${i}`)
];
export const subFocusReducer = (state, action) => {
  switch (action.type) {
    case Actions.switchFocusTarget: {
      const focusIndex =
        (focusTargets.indexOf(state.focusTarget) + 1) % focusTargets.length;
      return { ...state, focusTarget: focusTargets[focusIndex] };
    }
    case Actions.inputSuggestion:
      return { ...state, focusTarget: "input" };
    default:
      return state;
  }
};

export const inputSuggestionReducer = (state, action) => {
  switch (action.type) {
    case Actions.inputSuggestion: {
      // Replaces the last word of the input with the selected suggestion,
      // and add a whitespace at the end (that is the role of the last empty
      // string).
      const input = [
        ...state.input.split(" ").slice(0, -1),
        action.word,
        ""
      ].join(" ");
      return { ...state, input };
    }

    default:
      return state;
  }
};

export const keyboardTrackerReducer = (state, action) => {
  switch (action.type) {
    case Actions.keyDown:
      return { ...state, pressedKeys: [...state.pressedKeys, action.key] };
    case Actions.keyUp:
      return {
        ...state,
        pressedKeys: state.pressedKeys.filter(key => key !== action.key)
      };
    default:
      return state;
  }
};

// Creates the main reducer, by applying each reducer one after the other.
const reducers = [
  charReducer,
  keyboardLayoutReducer,
  inputSuggestionReducer,
  keyboardTrackerReducer,
  subFocusReducer,
  docFocusReducer
];
const trialReducer = (state, action) =>
  reducers.reduce((newState, reducer) => reducer(newState, action), state);

export default trialReducer;
