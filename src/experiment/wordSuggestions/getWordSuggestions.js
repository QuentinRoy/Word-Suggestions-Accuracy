import { getRksImprovement } from "../input";
import { insertEject } from "../../utils/arrays";
import { isUpperCase } from "../../utils/strings";
import suggestionScore from "./suggestionScore";

export default function getWordSuggestions(
  inputWord,
  targetWordSKS,
  targetWord,
  totalSuggestions,
  dictionary,
  canReplaceLetters
) {
  const isFirstCharUpper =
    inputWord != null &&
    inputWord !== "" &&
    targetWord != null &&
    isUpperCase(targetWord.charAt(0));

  // Pre-fill the top words with the most frequent in the dictionary, provided
  // that none are the same as the target word, but give them a score of
  // 0 so that they are immediately replaced by anything else.
  const topWords = Array.from({ length: totalSuggestions }, () => ({
    word: null,
    score: -1
  }));

  const wordEntryScoreGetter = e => e.score;
  const insertSuggestion = (word, score) => {
    insertEject(topWords, { word, score }, wordEntryScoreGetter);
  };

  const lowerCaseTargetWord =
    targetWord != null ? targetWord.toLowerCase() : null;

  const lowerCaseInputWord = inputWord.toLowerCase();

  if (
    lowerCaseTargetWord != null &&
    targetWordSKS >=
      getRksImprovement(
        lowerCaseInputWord,
        lowerCaseTargetWord,
        lowerCaseTargetWord
      ) &&
    (canReplaceLetters || lowerCaseTargetWord.startsWith(lowerCaseInputWord))
  ) {
    insertSuggestion(targetWord, Number.POSITIVE_INFINITY);
  }

  for (let i = 0; i < dictionary.length; i += 1) {
    const { word, f: frequencyScore } = dictionary[i];
    const lowercaseSuggestion = word.toLowerCase();

    if (
      lowercaseSuggestion !== lowerCaseTargetWord &&
      (lowerCaseTargetWord == null ||
        targetWordSKS >=
          getRksImprovement(
            lowerCaseInputWord,
            `${lowercaseSuggestion} `,
            lowerCaseTargetWord
          )) &&
      (canReplaceLetters || lowercaseSuggestion.startsWith(lowerCaseInputWord))
    ) {
      const score = suggestionScore(
        frequencyScore,
        lowercaseSuggestion,
        lowerCaseInputWord
      );
      insertSuggestion(`${word} `, score);
    }
  }

  return topWords
    .filter(w => w.word != null)
    .map(
      isFirstCharUpper
        ? w => w.word.charAt(0).toUpperCase() + w.word.slice(1)
        : w => w.word
    );
}
