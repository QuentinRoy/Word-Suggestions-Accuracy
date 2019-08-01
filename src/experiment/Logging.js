const logging = (
  eventName,
  inputRemoved,
  button,
  text,
  newInput,
  newSuggestions,
  suggestionUsed,
  correctCharsCount,
  onLog,
  eventList
) => {
  eventList.current.push({
    event: eventName,
    added_input: inputRemoved === null ? button : null,
    removed_input: inputRemoved === null ? null : inputRemoved,
    input: newInput,
    is_error:
      ((eventName === "add_character" || eventName === "add_space") &&
        button !== text[newInput.length - 1]) ||
      eventName ===
        "failed_keystroke_for_delay" /*||
      eventName === "used_suggestion" && suggestionUsed[suggestionUsed.length] !== text[]*/,
    suggestion_1: newSuggestions[0] || null,
    suggestion_2: newSuggestions[1] || null,
    suggestion_3: newSuggestions[2] || null,
    suggestion_used: suggestionUsed,
    total_correct_characters: correctCharsCount,
    total_incorrect_characters: newInput.length - correctCharsCount,
    total_sentence_characters: text.length,
    time: new Date().toISOString()
  });
  onLog("events", eventList);
};

export default logging;
