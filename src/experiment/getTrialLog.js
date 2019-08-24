import { Actions } from "../utils/constants";
import { getTextFromSksDistribution } from "./input";

const timeZone = (() => {
  if (Intl != null && Intl.DateTimeFormat != null) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return null;
})();

const getTrialLog = (
  events,
  id,
  targetAccuracy,
  keyStrokeDelay,
  totalKss,
  sdWordsKss,
  sksDistribution,
  startDate,
  endDate
) => {
  const sentence = getTextFromSksDistribution(sksDistribution);

  let totalKeyStrokes = 0;
  let totalKeyStrokeErrors = 0;
  let totalSuggestionErrors = 0;
  let totalSuggestionUsed = 0;
  let actualSks = 0;
  events.forEach(evt => {
    if (evt.type === Actions.inputChar || evt.type === Actions.deleteChar) {
      if (evt.isError) totalKeyStrokeErrors += 1;
      totalKeyStrokes += 1;
    }
    if (evt.type === Actions.inputSuggestion) {
      if (evt.isError) totalSuggestionErrors += 1;
      totalSuggestionUsed += 1;
      actualSks += evt.diffRemainingKeyStrokes;
    }
  });

  const sentenceWordsAndSks = sksDistribution
    .map(item => `${item.word}{${item.sks}}`)
    .join(" ");

  const theoreticalSks = sksDistribution
    .map(item => item.sks)
    .reduce((a, b) => {
      return a + b;
    }, 0);

  return {
    id,
    sentence,
    targetAccuracy,
    keyStrokeDelay,
    totalKss,
    sentenceWordsAndSks,
    sdWordsKss,
    theoreticalSks,
    startDate,
    endDate,
    duration: endDate - startDate,
    totalKeyStrokes,
    totalKeyStrokeErrors,
    actualSks,
    totalSuggestionUsed,
    totalSuggestionErrors,
    timeZone,
    gitSha: process.env.REACT_APP_GIT_SHA,
    version: process.env.REACT_APP_VERSION
  };
};

export default getTrialLog;
