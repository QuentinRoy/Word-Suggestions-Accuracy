import json
import csv
import os
from itertools import chain
from csv_export import csv_export
from config_tasks import iter_typing_tasks, TYPING_SPEED_TASK, create_task_iterator
from utils import copy_rename

log_dir = "/Users/quentinroy/Documents/Projects/Word Suggestions/data 2021-03-15"

json_logs_dir = os.path.join(log_dir, "multi-device")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "events.csv"))

typing_test_json_logs_dir = os.path.join(log_dir, "multi-device-typing")
typing_test_output_file_path = os.path.abspath(
    os.path.join(typing_test_json_logs_dir, "events.csv")
)

log_columns = {
    "wave": "wave",
    "version": "version",
    "git_sha": "gitSha",
    "run_uuid": "runUuid",
    "config_uuid": "configUuid",
    "participant": "participant",
    "trial_id": "key",
    "accuracy": "targetAccuracy",
    "is_practice": "isPractice",
    "device": "device",
    "config": "config",
}

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
    "request_time": "requestTime",
    "response_time": "responseTime",
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
        if previous_event["isInputCorrect"]
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
    base = {"file_name": file_name}
    copy_rename(task, base, log_columns)
    copy_rename(task["trial"], base, trial_columns)
    sentence = task["trial"]["sentence"]
    sentence_words = get_sentence_words(sentence)
    prev_event = None
    for event_number, event in enumerate(task["events"]):
        target_word_number = get_target_word_idx(
            event, prev_event, sentence, sentence_words
        )
        target_word = (
            None if target_word_number is None else sentence_words[target_word_number]
        )
        record = base.copy()
        record["event_number"] = event_number
        copy_rename(event, record, event_columns)
        record["target_word"] = target_word
        record["target_word_number"] = target_word_number
        yield record
        prev_event = event


if __name__ == "__main__":
    header = list(
        chain(
            ["file_name", "event_number"],
            log_columns.keys(),
            trial_columns.keys(),
            event_columns.keys(),
            ["target_word_number", "target_word"],
        )
    )

    def create_log_progress(output_file_path):
        def log_progress(number_of_written_rows):
            if number_of_written_rows > 0:
                print("\033[F", end="")
            print(
                "{:,} rows written in {}.".format(
                    number_of_written_rows, output_file_path
                ),
            )

        return log_progress

    csv_export(
        json_logs_dir,
        output_file_path,
        header,
        iter_events,
        iter_typing_tasks,
        participant_registry_path=None,
        log_progress=create_log_progress(output_file_path),
    )

    csv_export(
        typing_test_json_logs_dir,
        typing_test_output_file_path,
        header,
        iter_events,
        create_task_iterator(TYPING_SPEED_TASK),
        participant_registry_path=None,
        log_progress=create_log_progress(typing_test_output_file_path),
    )
