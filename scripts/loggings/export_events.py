import json
import csv
import os
from itertools import chain
from csv_export import csv_export
from config_tasks import iter_typing_tasks
from utils import copy_rename

IS_ANONYMOUS = True

log_dir = "/Users/quentinroy/Documents/Projects/Word Suggestions/data 2021-03-15"
json_logs_dir = os.path.join(log_dir, "first-experiments")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "events.csv"))
p_registry_path = os.path.abspath(os.path.join(json_logs_dir, "p_registry.csv"))
r_registry_path = os.path.abspath(os.path.join(json_logs_dir, "r_registry.csv"))

log_columns = {
    "participant": "participant",
    "trial_id": "key",
    "accuracy": "targetAccuracy",
    "is_practice": "isPractice",
}

if not IS_ANONYMOUS:
    log_columns.update({"hit_id": "hitId", "assignment_id": "assignmentId"})

event_columns = {
    "type": "type",
    "scheduled_action": "scheduledAction",
    "focus_target": "focusTarget",
    "added_input": "addedInput",
    "removed_input": "removedInput",
    "input": "input",
    "is_error": "isError",
    "remaining_key_strokes": "remainingKeyStrokes",
    "diff_remaining_key_strokes": "diffRemainingKeyStrokes",
    "suggestion_0": "suggestion0",
    "suggestion_1": "suggestion1",
    "suggestion_2": "suggestion2",
    "used_suggestion": "usedSuggestion",
    "total_correct_characters": "totalCorrectCharacters",
    "total_incorrect_characters": "totalIncorrectCharacters",
    "is_input_correct": "isInputCorrect",
    "is_target_completed": "isTargetCompleted",
    "action_start_time": "actionStartTime",
    "time": "time",
}

trial_columns = {"sentence": "sentence"}


def get_correct_input(input, sentence):
    result = ""
    for i in range(0, min(len(input), len(sentence))):
        if input[i] == sentence[i]:
            result += input[i]
        else:
            break
    return result


def get_sentence_words(sentence):
    return list(filter(lambda w: len(w) > 0, sentence.split(" ")))


def get_target_word_idx(event, previous_event, sentence, sentence_words):
    if previous_event is None:
        return 0
    correct_input_before = (
        previous_event["input"]
        if previous_event["isError"]
        else get_correct_input(previous_event["input"], sentence)
    )
    input_length = len(correct_input_before)
    sentence_size = 0
    for word_idx, word in enumerate(sentence_words):
        sentence_size += len(word) + 1  # +1 for space.
        if sentence_size > input_length:
            return word_idx
    return None


def iter_events(task, file_name, **kwargs):
    if not "start" in task:
        return
    base = (
        {"run_id": file_name}
        if IS_ANONYMOUS
        else {"run_id": file_name, "file_name": file_name}
    )
    copy_rename(task, base, log_columns)
    copy_rename(task["trial"], base, trial_columns)
    sentence = task["trial"]["sentence"]
    sentence_words = get_sentence_words(sentence)
    prev_event = None
    for event_number, event in enumerate(task["events"]):
        record = base.copy()
        target_word_number = get_target_word_idx(
            event, prev_event, sentence, sentence_words
        )
        record["target_word_number"] = target_word_number
        record["target_word"] = (
            None if target_word_number is None else sentence_words[target_word_number]
        )
        record["event_number"] = event_number
        copy_rename(event, record, event_columns)
        yield record
        prev_event = event


if __name__ == "__main__":

    def log_progress(number_of_written_rows):
        if number_of_written_rows > 0:
            print("\033[F", end="")
        print(
            "{:,} rows written in {}.".format(number_of_written_rows, output_file_path),
        )

    header = list(
        chain(
            ["run_id", "event_number"]
            if IS_ANONYMOUS
            else ["run_id", "file_name", "event_number"],
            log_columns.keys(),
            trial_columns.keys(),
            event_columns.keys(),
            ["target_word_number", "target_word"],
        )
    )
    csv_export(
        json_logs_dir,
        output_file_path,
        header,
        iter_events,
        iter_typing_tasks,
        participant_registry_path=p_registry_path if IS_ANONYMOUS else None,
        run_registry_path=r_registry_path,
        log_progress=log_progress,
    )
