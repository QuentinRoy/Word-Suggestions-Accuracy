import { insertEject } from "../utils/arrays";
import {
  isUpperCase,
  totalMatchedChars,
  totalMatchedCharsFromStart
} from "../utils/strings";
import { getCurrentInputWord, getRksImprovement } from "./input";

/** Compute a suggestion score based on an input word as specified in
 * https://android.googlesource.com/platform/packages/inputmethods/LatinIME/+/jb-release/native/jni/src/correction.cpp#1098
 *
 * @param {number} suggestionFScore the suggestion frequency score, as provided
 * by the frequency dictionary. It ranges from 0 to 255.
 * @param {string} suggestion the suggestion to test. WARNING, it is expected to
 * be lowercase with all accents removed.
 * @param {string} inputWord the (often partial) input word. WARNING, it is
 * expected to be lowercase with all accents removed.
 * @returns {number} the normalized score
 */
const suggestionScore = (suggestionFScore, suggestion, inputWord) => {
  const minLength = Math.min(suggestion.length, inputWord.length);
  // This is (almost) the max possible score for this word/suggestion couple.
  // We use it for normalization.
  const maxScore = 2 ** minLength * 255 * 2;
  let multiplier = 1;
  if (totalMatchedCharsFromStart(suggestion, inputWord) === minLength) {
    multiplier *= 1.2;
  }
  if (suggestion.length === inputWord.length) {
    multiplier *= 2;
  }
  // We should also compare the words without accents here, but it does not
  // matter since all sentences are in English.
  const wordScore = suggestion === inputWord ? 255 : suggestionFScore;
  const score =
    2 ** (totalMatchedChars(suggestion, inputWord) * wordScore) * multiplier;
  // Normalize the score.
  return score / maxScore;
};

function computeSuggestions(
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

// Returns a new state with the suggestions filled in based on the input.
const getSuggestions = (
  totalSuggestions,
  dictionary,
  sksDistribution,
  input,
  canReplaceLetters
) => {
  const { word: inputWord, index: currentInputWordIndex } = getCurrentInputWord(
    input
  );

  let sks = null;
  let targetWord = null;
  if (currentInputWordIndex < sksDistribution.length) {
    ({ sks, word: targetWord } = sksDistribution[currentInputWordIndex]);
  }

  return computeSuggestions(
    inputWord,
    sks,
    targetWord,
    totalSuggestions,
    dictionary,
    canReplaceLetters
  );
};

export default getSuggestions;
