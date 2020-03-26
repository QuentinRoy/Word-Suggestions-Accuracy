import { totalMatchedCharsFromStart } from "../common/utils/strings";
import { count } from "../common/utils/arrays";

/**
 * @param {string} input The input, i.e. what has been typed by the user.
 * @param {string} target The target text, i.e. what the user must type.
 * @returns {bool} True if the input matches the target, ignoring extra
 * white spaces at the end of the input, false otherwise.
 */
export const isTargetCompleted = (input, target) => input === target;

/**
 * @param {string} input The input, i.e. what has been typed by the user.
 * @param {string} target The target text, i.e. what the user must type.
 * @returns {number} The number of correct characters in the input.
 */
export const getTotalCorrectCharacters = (input, target) => {
  return totalMatchedCharsFromStart(target, input);
};

/**
 * @param {string} input The input, i.e. what has been typed by the user.
 * @param {string} target The target text, i.e. what the user must type.
 * @returns {number} The number of characters the user needs to be remove,
 * knowing that they can only erase the last character of the input every time.
 */
export const getTotalIncorrectCharacters = (input, target) =>
  input.length - getTotalCorrectCharacters(input, target);

/**
 * @param {string} input The input, i.e. what has been typed by the user.
 * @param {string} target The target text, i.e. what the user must type.
 * @returns {bool} True if there are no incorrect characters in the input.
 */
export const isInputCorrect = (input, target) =>
  getTotalIncorrectCharacters(input, target) === 0;

/**
 * @param {string} input The input, i.e. what has been typed by the user.
 * @param {string} target The target text, i.e. what the user must type.
 * @returns {number} The smallest number of manual key strokes to get to the
 * target.
 */
export const getRemainingKeyStrokes = (input, target) => {
  return (
    target.length +
    // We need to add the number of incorrect characters, since these need to be
    // removed.
    getTotalIncorrectCharacters(input, target) -
    getTotalCorrectCharacters(input, target)
  );
};

/**
 * @param {string} input The input word, i.e. what would be replaced by the
 * suggestion.
 * @param {string} newInput The suggestion.
 * @param {string} target The target word, i.e. what should be the target
 * word if correct and completed.
 * @returns {number} the difference of remaining key strokes between the input
 * and the new input.
 */
export const getRksImprovement = (input, newInput, target) => {
  const prevRemainingKeyStrokes = getRemainingKeyStrokes(input, target);
  const newRemainingKeyStrokes = getRemainingKeyStrokes(newInput, target);
  return prevRemainingKeyStrokes - newRemainingKeyStrokes;
};

/**
 * @param {string} fullInput The input, i.e. what the user typed.
 * @return {{ word: string, index: number }} The last word of the input, and its
 * index.
 */
export const getCurrentInputWord = (fullInput) => {
  // This may produce empty words (""). This is OK.
  const inputWords = fullInput.split(" ");
  // Note: if input ends with a space, then the input word is "". This is
  // on purpose.
  const currentInputWord = inputWords[inputWords.length - 1];

  // Since inputWords may contain empty words, we only count the non empty
  // ones.
  const totalWordsInInput = count(inputWords, (w) => w !== "");
  const currentWordIndex =
    currentInputWord === "" ? totalWordsInInput : totalWordsInInput - 1;
  return {
    word: currentInputWord,
    index: currentWordIndex,
  };
};

/**
 * @param {{word,sks}[]} sksDistribution The distribution of saved key strokes.
 * @return {string} the corresponding text
 */
export const getTextFromSksDistribution = (sksDistribution) =>
  sksDistribution.map((w) => w.word).join("");
