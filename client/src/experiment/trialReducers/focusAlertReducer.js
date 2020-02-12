import { Actions } from "../../utils/constants";

export default function focusAlertReducer(state, action) {
  switch (action.type) {
    case Actions.windowBlurred:
      return { ...state, isFocusAlertShown: true };
    case Actions.closeFocusAlert:
      return { ...state, isFocusAlertShown: false };
    default:
      return state;
  }
}
