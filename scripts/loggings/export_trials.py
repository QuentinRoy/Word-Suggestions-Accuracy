import json
import csv
import os
from itertools import chain
from csv_export import csv_export
from config_tasks import (
    iter_typing_tasks,
    INPUT_CHAR_EVENT,
    DELETE_CHAR_EVENT,
    INPUT_SUGGESTION_EVENT,
)
from utils import copy_rename

IS_ANONYMOUS = True

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../participants-logs/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "trials.csv"))
p_registry_path = os.path.abspath(os.path.join(json_logs_dir, "p_registry.csv"))
r_registry_path = os.path.abspath(os.path.join(json_logs_dir, "r_registry.csv"))

log_columns = {
    "participant": "participant",
    "trial_id": "key",
    "total_kss": "totalKss",
    "sd_word_kss": "sdWordsKss",
    "is_practice": "isPractice",
    "suggestions_type": "suggestionsType",
}
if not IS_ANONYMOUS:
    log_columns.update({"hit_id": "hitId", "assignment_id": "assignmentId"})


trial_columns = {
    "sentence": "sentence",
    "target_accuracy": "targetAccuracy",
    "key_stroke_delay": "keyStrokeDelay",
    "sentence_words_and_sks": "sentenceWordsAndSks",
    "theoretical_sks": "theoreticalSks",
    "start_date": "startDate",
    "end_date": "endDate",
    "duration": "duration",
    "total_key_strokes": "totalKeyStrokes",
    "total_key_strokeErrors": "totalKeyStrokeErrors",
    "actual_sks": "actualSks",
    "total_suggestion_used": "totalSuggestionUsed",
    "total_suggestion_errors": "totalSuggestionErrors",
    "time_zone": "timeZone",
    "version": "version",
}
if not IS_ANONYMOUS:
    trial_columns.update({"git_sha": "gitSha"})

other_columns = [
    "run_id",
    "total_removed_manual_chars",
    "total_removed_suggestion_chars",
    "total_final_suggestion_chars",
    "total_final_manual_chars",
]
if not IS_ANONYMOUS:
    other_columns.append("file_name")


def get_ks_info(task):
    if not "events" in task:
        return {}
    char_input_sources = []
    total_removed_manual_char = 0
    total_removed_suggestion_char = 0
    for event in task["events"]:
        if "type" not in event:
            continue
        event_type = event["type"]
        if event_type == INPUT_CHAR_EVENT:
            char_input_sources.append("input")
        elif event_type == DELETE_CHAR_EVENT:
            if len(char_input_sources) <= 0:
                continue
            if char_input_sources.pop() == "input":
                total_removed_manual_char += 1
            else:
                total_removed_suggestion_char += 1
        elif event_type == INPUT_SUGGESTION_EVENT:
            char_input_sources.extend(["suggestion"] * len(event["addedInput"]))
    return {
        "total_removed_manual_chars": total_removed_manual_char,
        "total_removed_suggestion_chars": total_removed_suggestion_char,
        "total_final_suggestion_chars": char_input_sources.count("suggestion"),
        "total_final_manual_chars": char_input_sources.count("input"),
    }


# This should just yield once, but we still use an iterators for consistency
# with export_events.
def iter_trials(task, file_name, **kwargs):
    record = {"run_id": file_name} 
    if not IS_ANONYMOUS:
        record["file_name"] = file_name
    copy_rename(task, record, log_columns)
    if "trial" in task:
        copy_rename(task["trial"], record, trial_columns)
    record.update(get_ks_info(task))
    yield record


if __name__ == "__main__":
    header = list(chain(log_columns.keys(), trial_columns.keys(), other_columns))
    csv_export(
        json_logs_dir,
        output_file_path,
        header,
        iter_trials,
        iter_typing_tasks,
        participant_registry_path=p_registry_path if IS_ANONYMOUS else None,
        run_registry_path=r_registry_path,
    )
    print("{} written.".format(output_file_path))
