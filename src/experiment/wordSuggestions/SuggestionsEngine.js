import { getCurrentInputWord } from "../input";
import getWordSuggestions from "./getWordSuggestions";

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

    let sks = null;
    let targetWord = null;
    if (currentInputWordIndex < sksDistribution.length) {
      ({ sks, word: targetWord } = sksDistribution[currentInputWordIndex]);
    }

    return getWordSuggestions(
      inputWord,
      sks,
      targetWord,
      totalSuggestions,
      dictionary,
      canReplaceLetters
    );
  };

  return { getSuggestions };
}
