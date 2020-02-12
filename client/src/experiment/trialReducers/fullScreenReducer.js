import { Actions } from "../../utils/constants";

export default function focusAlertReducer(state, action) {
  switch (action.type) {
    case Actions.fullScreenEntered:
      return { ...state, isFullScreen: true };
    case Actions.fullScreenLeft:
      return { ...state, isFullScreen: false };
    default:
      return state;
  }
}
