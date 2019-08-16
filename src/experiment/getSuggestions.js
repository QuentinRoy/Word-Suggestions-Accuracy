import { count, insertEject } from "../utils/arrays";
import {
  isUpperCase,
  totalMatchedChars,
  totalMatchedCharsFromStart
} from "../utils/strings";

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

function isCloseFromTargetWord(word, targetWord) {}

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
  const insertTopWord = (word, score) => {
    insertEject(topWords, { word, score }, wordEntryScoreGetter);
  };

  if (
    targetWord != null &&
    targetWordSKS >=
      targetWord.length - totalMatchedChars(targetWord, inputWord)
  ) {
    insertTopWord(targetWord, Number.POSITIVE_INFINITY);
  }

  const lowerCaseTargetWord =
    targetWord != null ? targetWord.toLowerCase() : null;
  const lowerCaseInputWord = inputWord.toLowerCase();
  for (let i = 0; i < dictionary.length; i += 1) {
    const { word, f: frequencyScore } = dictionary[i];
    const lowercaseWord = word.toLowerCase();
    if (
      (lowerCaseTargetWord == null || lowercaseWord !== lowerCaseTargetWord) &&
      (canReplaceLetters || lowercaseWord.startsWith(lowerCaseInputWord))
    ) {
      const score = suggestionScore(
        frequencyScore,
        lowercaseWord,
        lowerCaseInputWord
      );
      insertTopWord(word, score);
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
  // This may produce empty words (""). This is OK.
  const inputWords = input.split(" ");
  // Note: if input ends with a space, then the input word is "". This is
  // on purpose.
  const currentInputWord =
    inputWords.length > 0 ? inputWords[inputWords.length - 1] : "";

  // Since inputWords may contain empty words, we only count the non empty
  // one.
  const totalInputWords = count(inputWords, w => w !== "");
  const currentWordIndex =
    currentInputWord === "" ? totalInputWords : totalInputWords - 1;
  const currentWord = sksDistribution[currentWordIndex];

  return computeSuggestions(
    currentInputWord,
    currentWord == null ? null : currentWord.sks,
    currentWord == null ? null : currentWord.word,
    totalSuggestions,
    dictionary,
    canReplaceLetters
  );
};

export default getSuggestions;
