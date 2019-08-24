import { totalMatchedCharsFromStart, trimEnd } from "../utils/strings";
import { Actions, FocusTargetTypes } from "../utils/constants";
import { getTotalIncorrectCharacters } from "./input";

const isInputCorrect = (input, text) => trimEnd(input) === text;

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
  const text = sksDistribution.map(w => w.word).join(" ");
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
    scheduledAction: action.action == null ? null : action.action.type,
    focusTarget: exportFocusTarget(newState.focusTarget),
    addedInput,
    removedInput,
    input: newState.input,
    isError: oldTotalIncorrectChars < newTotalIncorrectChars,
    usedSuggestion:
      action.type === Actions.inputSuggestion ? action.word : null,
    // Because terminal spaces are ignored, the input length
    // may be longer than text and have no errors.
    totalCorrectCharacters: Math.min(
      newState.input.length - newTotalIncorrectChars,
      text.length
    ),
    totalIncorrectCharacters: newTotalIncorrectChars,
    isInputCorrect: isInputCorrect(newState.input, text),
    time: new Date()
  };
  newState.suggestions.forEach((s, i) => {
    log[`suggestion${i}`] = s;
  });
  return log;
};

export default getEventLog;
