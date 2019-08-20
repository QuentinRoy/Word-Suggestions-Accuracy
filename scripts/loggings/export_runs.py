import json
import csv
import os
from csv_export import csv_export
from to_camel_case import to_camel_case

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../participants-logs/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "runs.csv"))

columns = [
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
]

corpus_columns = {
    "corpusTargetAccuracy": "targetAccuracy",
    "corpusTargetSd": "targetSd",
    "corpusMaxDiffAccuracy": "maxDiffAccuracy",
    "corpusMaxDiffSd": "maxDiffSd",
    "wasCorpusShuffled": "shuffled",
}

# This should just yield once, but we still use an iterators for consistency
# with export_events.
def iter_run_record(run_record, file_name, **kwargs):
    record = {"file_name": file_name}
    for column_name in columns:
        if column_name in run_record:
            record[to_camel_case(column_name)] = run_record[column_name]
    for (csv_corpus_column, corpus_column) in corpus_columns.items():
        record[to_camel_case(csv_corpus_column)] = run_record["corpusConfig"][
            corpus_column
        ]
    yield record


if __name__ == "__main__":
    header = (
        ["file_name"]
        + list(to_camel_case(column) for column in columns)
        + list(to_camel_case(column) for column in corpus_columns.keys())
    )
    csv_export(json_logs_dir, output_file_path, header, iter_run_record)
    print("{} written.".format(output_file_path))
