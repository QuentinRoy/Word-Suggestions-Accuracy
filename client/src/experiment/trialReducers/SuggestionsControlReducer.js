import { SuggestionTypes } from "../../utils/constants";

export default function SuggestionsControlReducer({
  suggestionsType,
  totalSuggestions,
  wordSuggestionEngine,
  sksDistribution
}) {
  // It is not clear why this is a control reducer rather than a simple reducer
  // since it does not do anything with the initial state. I think it used to
  // but has changed since.
  return function suggestionControlReducer(state, action) {
    if (suggestionsType === SuggestionTypes.none) {
      return [];
    }
    const suggestions = wordSuggestionEngine.getSuggestions(
      suggestionsType === SuggestionTypes.inline ? 1 : totalSuggestions,
      sksDistribution,
      action.changes.input,
      suggestionsType === SuggestionTypes.bar
    );
    return { ...action.changes, suggestions };
  };
}
