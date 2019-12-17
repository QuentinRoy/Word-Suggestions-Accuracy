import { SuggestionTypes } from "../../utils/constants";

export default function SuggestionsControlReducer({
  suggestionsType,
  totalSuggestions,
  wordSuggestionEngine,
  sksDistribution
}) {
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
