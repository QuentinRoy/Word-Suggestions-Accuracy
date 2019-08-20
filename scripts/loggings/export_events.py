import json
import csv
import os
from itertools import chain
from csv_export import csv_export
from config_tasks import iter_typing_tasks

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../participants-logs/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "events.csv"))

log_columns = {
    "participant": "participant",
    "hit_id": "hitId",
    "assignment_id": "assignmentId",
    "trial_id": "key",
    "accuracy": "weightedAccuracy",
    "is_practice": "isPractice",
}

event_columns = {
    "type": "type",
    "scheduledAction": "scheduledAction",
    "focusTarget": "focusTarget",
    "added_input": "addedInput",
    "removed_input": "removedInput",
    "input": "input",
    "is_error": "isError",
    "suggestion_1": "suggestion0",
    "suggestion_2": "suggestion1",
    "suggestion_3": "suggestion2",
    "used_suggestion": "usedSuggestion",
    "total_correct_characters": "totalCorrectCharacters",
    "total_incorrect_characters": "totalIncorrectCharacters",
    "total_sentence_characters": "totalSentenceCharacters",
    "is_input_correct": "isInputCorrect",
    "time": "time",
}

trial_columns = {"sentence": "sentence"}


def iter_events(task, file_name, **kwargs):
    if not "start" in task:
        return
    base = {"file_name": file_name}
    for (column_name, json_name) in log_columns.items():
        if json_name in task:
            base[column_name] = task[json_name]
    for (column_name, json_name) in trial_columns.items():
        if json_name in task["trial"]:
            base[column_name] = task["trial"][json_name]
    for child in task["events"]:
        record = base.copy()
        for (column_name, json_name) in event_columns.items():
            if json_name in child:
                record[column_name] = child[json_name]
        yield record


if __name__ == "__main__":
    header = ["file_name"] + list(
        chain(log_columns.keys(), trial_columns.keys(), event_columns.keys())
    )
    csv_export(json_logs_dir, output_file_path, header, iter_events, iter_typing_tasks)
    print("{} written.".format(output_file_path))
