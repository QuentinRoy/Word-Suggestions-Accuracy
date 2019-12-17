import { SuggestionTypes } from "../../utils/constants";
import getSuggestions from "../getSuggestions";

export default function SuggestionsControlReducer({
  suggestionsType,
  totalSuggestions,
  dictionary,
  sksDistribution
}) {
  return function suggestionControlReducer(state, action) {
    if (suggestionsType === SuggestionTypes.none) {
      return [];
    }
    const suggestions = getSuggestions(
      suggestionsType === SuggestionTypes.inline ? 1 : totalSuggestions,
      dictionary,
      sksDistribution,
      action.changes.input,
      suggestionsType === SuggestionTypes.bar
    );
    return { ...action.changes, suggestions };
  };
}
