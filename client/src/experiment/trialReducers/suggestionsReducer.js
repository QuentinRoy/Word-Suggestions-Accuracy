import { Actions } from "../../utils/constants";

export default function suggestionsReducer(state, action) {
  switch (action.type) {
    case Actions.updateSuggestions:
      return { ...state, suggestions: action.suggestions };
    default:
      return state;
  }
}
