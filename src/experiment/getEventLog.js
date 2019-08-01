const getEventLog = (
  eventName,
  inputRemoved,
  button,
  text,
  newInput,
  newSuggestions,
  suggestionUsed,
  correctCharsCount
) => {
  return {
    event: eventName,
    addedInput: inputRemoved === null ? button : null,
    removedInput: inputRemoved === null ? null : inputRemoved,
    input: newInput,
    isError:
      ((eventName === "add_character" || eventName === "add_space") &&
        button !== text[newInput.length - 1]) ||
      eventName === "failed_keystroke_for_delay",
    suggestion1: newSuggestions[0] || null,
    suggestion2: newSuggestions[1] || null,
    suggestion3: newSuggestions[2] || null,
    suggestionUsed,
    totalCorrectCharacters: correctCharsCount,
    totalIncorrectCharacters: newInput.length - correctCharsCount,
    totalSentenceCharacters: text.length,
    time: new Date().toISOString()
  };
};

export default getEventLog;
