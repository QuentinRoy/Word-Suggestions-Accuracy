import json
import csv
import os
from itertools import chain
from csv_export import csv_export
from config_tasks import iter_typing_tasks
from utils import copy_rename

IS_ANONYMOUS = True

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../participants-logs/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "events.csv"))
p_registry_path = os.path.abspath(os.path.join(json_logs_dir, "p_registry.csv"))

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


def iter_events(task, file_name, **kwargs):
    if not "start" in task:
        return
    base = {} if IS_ANONYMOUS else {"file_name": file_name}
    copy_rename(task, base, log_columns)
    copy_rename(task["trial"], base, trial_columns)
    for event_number, event in enumerate(task["events"]):
        record = base.copy()
        record["event_number"] = event_number
        copy_rename(event, record, event_columns)
        yield record


if __name__ == "__main__":
    header = list(
        chain(
            ["event_number"] if IS_ANONYMOUS else ["file_name", "event_number"],
            log_columns.keys(),
            trial_columns.keys(),
            event_columns.keys(),
        )
    )
    csv_export(
        json_logs_dir,
        output_file_path,
        header,
        iter_events,
        iter_typing_tasks,
        participant_registry_path=p_registry_path if IS_ANONYMOUS else None,
    )
    print("{} written.".format(output_file_path))