import { getCurrentInputWord } from "../input";
import getMockedWordSuggestions from "./getMockedWordSuggestions";

// This could be reimplemented using wasm to speed things up.
export default function SuggestionsEngine(dictionary) {
  // Returns a new state with the suggestions filled in based on the input.
  const getSuggestions = (
    totalSuggestions,
    sksDistribution,
    input,
    canReplaceLetters
  ) => {
    const {
      word: inputWord,
      index: currentInputWordIndex
    } = getCurrentInputWord(input);

    let correctSuggestionPositions = null;
    let targetWord = null;
    if (currentInputWordIndex < sksDistribution.length) {
      ({ correctSuggestionPositions, word: targetWord } = sksDistribution[
        currentInputWordIndex
      ]);
    }

    return getMockedWordSuggestions({
      inputWord,
      targetWord,
      totalSuggestions,
      dictionary,
      canReplaceLetters,
      correctSuggestionPositions
    });
  };

  return { getSuggestions };
}
