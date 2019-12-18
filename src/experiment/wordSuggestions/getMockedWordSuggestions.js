import { getRksImprovement } from "../input";
import getWordSuggestions from "./getWordSuggestions";

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

const shouldCorrectSuggestionBeShown = ({
  lowerCaseTargetWord,
  sks,
  lowerCaseInputWord,
  canReplaceLetters
}) =>
  lowerCaseTargetWord != null &&
  sks >=
    getRksImprovement(
      lowerCaseInputWord,
      lowerCaseTargetWord,
      lowerCaseTargetWord
    ) &&
  (canReplaceLetters || lowerCaseTargetWord.startsWith(lowerCaseInputWord));

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

  // if (
  //   shouldCorrectSuggestionBeShown({
  //     lowerCaseTargetWord,
  //     sks,
  //     lowerCaseInputWord,
  //     canReplaceLetters
  //   })
  // ) {
  //   const correctPosition = getCorrectSuggestionPosition({ totalSuggestions });
  //   return [
  //     ...algoWordSuggestions.slice(0, correctPosition),
  //     targetWord,
  //     ...algoWordSuggestions.slice(
  //       correctPosition,
  //       algoWordSuggestions.length - 1
  //     )
  //   ];
  // }

  return algoWordSuggestions;
}
