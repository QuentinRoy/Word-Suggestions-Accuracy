import { totalMatchedCharsFromStart } from "../utils/strings";
import { Actions, FocusTargetTypes } from "../utils/constants";
import {
  getTotalIncorrectCharacters,
  getRemainingKeyStrokes,
  getTextFromSksDistribution,
  getRksImprovement,
  isTargetCompleted,
  isInputCorrect
} from "./input";

const exportFocusTarget = focusTarget => {
  if (focusTarget == null) return null;
  switch (focusTarget.type) {
    case FocusTargetTypes.input:
      return FocusTargetTypes.input;
    case FocusTargetTypes.suggestion:
      return `${FocusTargetTypes.suggestion}-${focusTarget.suggestionNumber}`;
    default:
      throw new Error(`Unknown focus target type: ${focusTarget.type}`);
  }
};

const getEventLog = (oldState, action, newState, { sksDistribution }) => {
  const text = getTextFromSksDistribution(sksDistribution);
  const totalCommonCharsFromStart = totalMatchedCharsFromStart(
    oldState.input,
    newState.input
  );
  const oldTotalIncorrectChars = getTotalIncorrectCharacters(
    oldState.input,
    text
  );
  const newTotalIncorrectChars = getTotalIncorrectCharacters(
    newState.input,
    text
  );
  const addedInput = newState.input.slice(
    totalCommonCharsFromStart,
    newState.input.length
  );
  const removedInput = oldState.input.slice(
    totalCommonCharsFromStart,
    oldState.input.length
  );
  const log = {
    type: action.type,
    scheduledAction: action.action == null ? undefined : action.action.type,
    focusTarget: exportFocusTarget(newState.focusTarget),
    addedInput,
    removedInput,
    input: newState.input,
    isError: oldTotalIncorrectChars < newTotalIncorrectChars,
    remainingKeyStrokes: getRemainingKeyStrokes(newState.input, text),
    diffRemainingKeyStrokes: -getRksImprovement(
      oldState.input,
      newState.input,
      text
    ),
    usedSuggestion:
      action.type === Actions.inputSuggestion ? action.word : undefined,
    // Because terminal spaces are ignored, the input length
    // may be longer than text and have no errors.
    totalCorrectCharacters: Math.min(
      newState.input.length - newTotalIncorrectChars,
      text.length
    ),
    totalIncorrectCharacters: newTotalIncorrectChars,
    isInputCorrect: isInputCorrect(newState.input, text),
    isTargetCompleted: isTargetCompleted(newState.input, text),
    time: new Date()
  };
  newState.suggestions.forEach((s, i) => {
    log[`suggestion${i}`] = s;
  });
  return log;
};

export default getEventLog;
