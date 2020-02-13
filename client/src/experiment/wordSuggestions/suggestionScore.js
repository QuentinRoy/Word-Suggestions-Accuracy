import {
  totalMatchedChars,
  totalMatchedCharsFromStart
} from "../../utils/strings";

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
    2 ** totalMatchedChars(suggestion, inputWord) * wordScore * multiplier;
  // Normalize the score.
  return score / maxScore;
};

export default suggestionScore;
