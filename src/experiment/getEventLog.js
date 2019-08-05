import { totalCommonCharFromStart } from "../utils/strings";
import { Actions } from "../utils/constants";

const getEventLog = (oldState, action, newState, { sksDistribution }) => {
  const sentence = sksDistribution.map(w => w.word).join(" ");
  const inputCommon = totalCommonCharFromStart(oldState.input, newState.input);
  const oldTotalIncorrectCharacters =
    oldState.input.length - totalCommonCharFromStart(sentence, oldState.input);
  const newTotalIncorrectCharacters =
    newState.input.length - totalCommonCharFromStart(sentence, newState.input);
  const addedInput = newState.input.slice(inputCommon, newState.input.length);
  const removedInput = oldState.input.slice(inputCommon, oldState.input.length);
  const log = {
    event: action.type,
    scheduledAction: action.action == null ? null : action.action.type,
    focusTarget: newState.focusTarget,
    addedInput,
    removedInput,
    input: newState.input,
    isError: oldTotalIncorrectCharacters < newTotalIncorrectCharacters,
    suggestionUsed:
      action.type === Actions.inputSuggestion ? action.word : null,
    totalCorrectCharacters: newState.input.length - newTotalIncorrectCharacters,
    totalIncorrectCharacters: newTotalIncorrectCharacters,
    totalSentenceCharacters: sentence.length,
    time: new Date()
  };
  newState.suggestions.forEach((s, i) => {
    log[`suggestion${i}`] = s;
  });
  return log;
};

export default getEventLog;
