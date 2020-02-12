import { getRksImprovement } from "../input";
import getWordSuggestions from "./getWordSuggestions";
import { totalMatchedChars } from "../../utils/strings";

const isAGoodSuggestion = (
  lowerCaseTargetWord,
  lowerCaseInputWord,
  lowercaseSuggestion
) =>
  lowerCaseTargetWord != null &&
  getRksImprovement(
    lowerCaseInputWord,
    `${lowercaseSuggestion} `,
    lowerCaseTargetWord
  ) > 0;

export default function getMockedWordSuggestions({
  inputWord,
  targetWord,
  totalSuggestions,
  dictionary,
  correctSuggestionPositions,
  canReplaceLetters
}) {
  const lowerCaseTargetWord = targetWord?.toLowerCase();
  const lowerCaseInputWord = inputWord.toLowerCase();

  const filter = suggestion => {
    const lowercaseSuggestion = suggestion.toLowerCase();
    return (
      lowercaseSuggestion !== lowerCaseTargetWord &&
      !isAGoodSuggestion(
        lowerCaseTargetWord,
        lowerCaseInputWord,
        lowercaseSuggestion
      ) &&
      (canReplaceLetters || lowercaseSuggestion.startsWith(lowerCaseInputWord))
    );
  };

  const algoWordSuggestions = getWordSuggestions({
    inputWord,
    targetWord,
    totalSuggestions,
    dictionary,
    filter
  });

  const targetTotalMatchingChars =
    targetWord == null
      ? 0
      : totalMatchedChars(lowerCaseInputWord, lowerCaseTargetWord);

  const correctSuggestionPosition =
    correctSuggestionPositions?.[targetTotalMatchingChars];

  if (correctSuggestionPosition != null) {
    // Positions starts from 1, not 0. We need to adjust it every time.
    return [
      ...algoWordSuggestions.slice(0, correctSuggestionPosition - 1),
      targetWord,
      ...algoWordSuggestions.slice(
        correctSuggestionPosition - 1,
        algoWordSuggestions.length - 1
      )
    ];
  }

  return algoWordSuggestions;
}
