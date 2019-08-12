import { totalMatchedCharsFromStart, trimEnd } from "../utils/strings";
import { Actions } from "../utils/constants";

const isInputCorrect = (input, text) => trimEnd(input) === text;

const getTotalIncorrectCharacters = (input, text) => {
  if (isInputCorrect(input, text)) return 0;
  return input.length - totalMatchedCharsFromStart(text, input);
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
    time: new Date(),
    suggestion: newState.suggestion
  };
  return log;
};

export default getEventLog;
