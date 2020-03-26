import { Actions } from "../../common/constants";

export default function InputSuggestionReducer(state, action) {
  if (action.type !== Actions.inputSuggestion) return state;
  const inputWithoutLastWord = state.input.slice(
    0,
    state.input.lastIndexOf(" ") + 1
  );
  return {
    ...state,
    input: `${inputWithoutLastWord}${action.word}`,
  };
}
