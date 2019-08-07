const getTrialLog = (
  events,
  id,
  targetAccuracy,
  keyStrokeDelay,
  weightedAccuracy,
  sdAccuracy,
  words,
  startDate,
  endDate
) => {
  const sentence = words.map(w => w.word).join(" ");
  const totalKeyStrokes = events.length - 1;
  let totalSuggestionUsed = 0;
  let totalCorrectSuggestionUsed = 0;
  let totalIncorrectSuggestionsUsed = 0;

  let actualSks = 0;
  let totalKeyStrokeErrors = 0;
  for (let i = 0; i < events.length; i += 1) {
    if (events[i].is_error === true) {
      totalKeyStrokeErrors += 1;
    }
    if (events[i].event === "used_suggestion") {
      totalSuggestionUsed += 1;
      if (events[i].input === sentence.slice(0, events[i].input.length)) {
        totalCorrectSuggestionUsed += 1;
        if (i > 0) {
          actualSks += events[i].input.length - events[i - 1].input.length;
        } else {
          actualSks += events[i].suggestion_used.length;
        }
      } else {
        totalIncorrectSuggestionsUsed += 1;
      }
    }
  }

  const timeZone = (() => {
    if (Intl != null && Intl.DateTimeFormat != null) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return null;
  })();

  const sentenceWordsAndSks = words
    .map(item => {
      return `${item.word}{${item.sks}}`;
    })
    .join(" ");

  const theoreticalSks = words
    .map(item => item.sks)
    .reduce((a, b) => {
      return a + b;
    }, 0);

  return {
    id,
    sentence,
    targetAccuracy,
    keyStrokeDelay,
    weightedAccuracy,
    sentenceWordsAndSks,
    sdAccuracy,
    theoreticalSks,
    startDate,
    endDate,
    duration: endDate - startDate,
    totalKeyStrokes,
    totalKeyStrokeErrors,
    actualSks,
    totalSuggestionUsed,
    totalCorrectSuggestionUsed,
    totalIncorrectSuggestionsUsed,
    timeZone,
    gitSha: process.env.REACT_APP_GIT_SHA,
    version: process.env.REACT_APP_VERSION
  };
};

export default getTrialLog;
