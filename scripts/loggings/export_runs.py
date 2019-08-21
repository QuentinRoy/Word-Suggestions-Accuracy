import json
import csv
import os
from csv_export import csv_export
from config_tasks import FINAL_FEEDBACKS, iter_task_of_type
from utils import to_snake_case, copy_rename

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../participants-logs/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "runs.csv"))

record_columns = dict(
    (to_snake_case(col), col)
    for col in [
        "participant",
        "assignmentId",
        "hitId",
        "corpusSize",
        "keyStrokeDelay",
        "targetAccuracy",
        "gitSha",
        "version",
        "confirmationCode",
        "totalSuggestions",
        "suggestionsType",
        "numberOfPracticeTasks",
        "numberOfTypingTasks",
        "href",
        "startDate",
        "endDate",
    ]
)


corpus_columns = {
    "corpus_target_accuracy": "targetAccuracy",
    "corpus_target_sd": "targetSd",
    "corpus_max_diff_accuracy": "maxDiffAccuracy",
    "corpus_max_diff_sd": "maxDiffSd",
    "was_corpus_shuffled": "shuffled",
}

other_columns = ["file_name", "feedbacks"]


def get_feedbacks(run_record):
    feedback_tasks = list(iter_task_of_type(run_record, FINAL_FEEDBACKS))
    assert len(feedback_tasks) == 1
    if "feedbacks" in feedback_tasks[0]:
        return feedback_tasks[0]["feedbacks"]
    return None


# This should just yield once, but we still use an iterators for consistency
# with export_events.
def iter_run_record(run_record, file_name, **kwargs):
    result = {"file_name": file_name, "feedbacks": get_feedbacks(run_record)}
    copy_rename(run_record, result, record_columns)
    copy_rename(run_record["corpusConfig"], result, corpus_columns)
    yield result


if __name__ == "__main__":
    header = list(record_columns.keys()) + list(corpus_columns.keys()) + other_columns
    csv_export(json_logs_dir, output_file_path, header, iter_run_record)
    print("{} written.".format(output_file_path))
