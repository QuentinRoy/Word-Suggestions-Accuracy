import json
import csv
import os
from itertools import chain
from csv_export import csv_export
from config_tasks import iter_typing_tasks

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../participants-logs/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "trials.csv"))

log_columns = {
    "participant": "participant",
    "hit_id": "hitId",
    "assignment_id": "assignmentId",
    "trial_id": "key",
    "mean_accuracy": "meanAccuracy",
    "weighted_accuracy": "weightedAccuracy",
    "sd_accuracy": "sdAccuracy",
    "diff_accuracy": "diffAccuracy",
    "diff_sd": "diffSd",
    "is_practice": "isPractice",
    "suggestions_type": "suggestionsType",
}

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
    "total_correct_suggestion_used": "totalCorrectSuggestionUsed",
    "total_incorrect_suggestions_used": "totalIncorrectSuggestionsUsed",
    "time_zone": "timeZone",
    "git_sha": "gitSha",
    "version": "version",
}


# This should just yield once, but we still use an iterators for consistency
# with export_events.
def iter_trials(task, file_name, **kwargs):
    record = {"file_name": file_name}
    for (column_name, json_name) in log_columns.items():
        if json_name in task:
            record[column_name] = task[json_name]
    if "trial" in task:
        for (column_name, json_name) in trial_columns.items():
            if json_name in task["trial"]:
                record[column_name] = task["trial"][json_name]
    yield record


if __name__ == "__main__":
    header = ["file_name"] + list(chain(log_columns.keys(), trial_columns.keys()))
    csv_export(json_logs_dir, output_file_path, header, iter_trials, iter_typing_tasks)
    print("{} written.".format(output_file_path))
