import { count, sliceIf } from "../utils/arrays";
import {
  isUpperCase,
  totalMatchedChars,
  totalMatchedCharsFromStart
} from "../utils/strings";

// The computation of this normalized score comes from
// https://android.googlesource.com/platform/packages/inputmethods/LatinIME/+/jb-release/native/jni/src/correction.cpp#1098
const frequencyScore = (wordFScore, suggestion, inputWord) => {
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
  const wordScore =
    suggestion.toLowerCase() === inputWord.toLowerCase() ? 255 : wordFScore;
  const score =
    2 ** (totalMatchedChars(suggestion, inputWord) * wordScore) * multiplier;
  // Normalize the score.
  return score / maxScore;
};
// The score is 0 if the suggestion don't start by the input word.

function computeSuggestions(
  inputWord,
  targetWordSKS,
  targetWord,
  totalSuggestions,
  dictionary
) {
  const isFirstCharUpper =
    inputWord !== undefined &&
    inputWord !== "" &&
    isUpperCase(targetWord.charAt(0));

  // Pre-fill the top words with the most frequent in the dictionary.
  const topWords = sliceIf(dictionary, 0, totalSuggestions, e => e.word);
  const topWordsScore = Array(totalSuggestions).fill(0);

  const insertTopWord = (wordToInsert, score) => {
    const capitalizedWordToInsert = isFirstCharUpper
      ? wordToInsert.charAt(0).toUpperCase() + wordToInsert.slice(1)
      : wordToInsert;
    const firstSmallestIndex = topWordsScore.findIndex(s => s < score);
    if (firstSmallestIndex >= 0) {
      // Insert the word at the corresponding location.
      topWordsScore.splice(firstSmallestIndex, 0, score);
      topWords.splice(firstSmallestIndex, 0, capitalizedWordToInsert);
      // Remove the extraneous words.
      topWordsScore.pop();
      topWords.pop();
    }
  };

  if (
    targetWord != null &&
    targetWordSKS >=
      targetWord.length - totalMatchedChars(targetWord, inputWord)
  ) {
    insertTopWord(targetWord, Number.POSITIVE_INFINITY);
  }

  dictionary.forEach(({ word, f: frequency }) => {
    if (targetWord == null || word.toLowerCase() !== targetWord.toLowerCase()) {
      const inputWordScore = frequencyScore(frequency, word, inputWord);
      insertTopWord(word, inputWordScore);
    }
  });

  return topWords;
}

// Returns a new state with the suggestions filled in based on the input.
const getSuggestions = (
  totalSuggestions,
  dictionary,
  sksDistribution,
  input
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
    dictionary
  );
};

export default getSuggestions;
