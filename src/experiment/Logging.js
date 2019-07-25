const Logging = (
  eventName,
  inputRemoved,
  button,
  text,
  input,
  suggestions,
  suggestionUsed,
  correctCharsCount,
  onLog,
  eventList
) => {
  eventList.current.push({
    event: eventName,
    button: inputRemoved === null ? button : inputRemoved,
    is_error:
      button !== text[input.length] &&
      (eventName === "add_character" || eventName === "add_space"),
    suggestion_1: suggestions[0],
    suggestion_2: suggestions[1],
    suggestion_3: suggestions[2],
    suggestion_used: suggestionUsed,
    input_when_suggestion_used: input,
    total_correct_characters: correctCharsCount,
    total_incorrect_characters: input.length - correctCharsCount,
    total_sentence_characters: text.length,
    time: new Date().toISOString()
  });
  onLog("events", eventList);
};

export default Logging;
