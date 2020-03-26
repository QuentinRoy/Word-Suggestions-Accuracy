import { Actions, KeyboardLayoutNames } from "../../common/constants";

export default function keyboardLayoutReducer(state, action) {
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
}
