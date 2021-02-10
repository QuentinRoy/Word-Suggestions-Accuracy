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
    TYPING_SPEED_TASK,
    create_task_iterator,
)
from utils import copy_rename

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../logs/multi-device")
output_file_path = os.path.abspath(
    os.path.join(json_logs_dir, "config-suggestions.csv")
)


log_columns = {
    "participant": "participant",
    "trial_id": "key",
    "total_kss": "totalKss",
    "sd_word_kss": "sdWordsKss",
    "is_practice": "isPractice",
    "suggestions_type": "suggestionsType",
    "config": "config",
    "run_uuid": "runUuid",
    "config_uuid": "configUuid",
    "device": "device",
    "wave": "wave",
}

other_columns = [
    "word_number",
    "word",
    "char_number",
    "input",
    "correct_suggestion_position",
    "file_name",
]


# This should just yield once, but we still use an iterators for consistency
# with export_events.
def iter_trials(task, file_name, **kwargs):
    trial_record = {"file_name": file_name}
    copy_rename(task, trial_record, log_columns)
    for word_number, word_entry in enumerate(task["sksDistribution"]):
        word = word_entry["word"]
        corSugPositions = word_entry["correctSuggestionPositions"]
        for char_number in range(0, len(word)):
            record = {
                "word": word,
                "word_number": word_number,
                "char_number": char_number,
                "input": word[:char_number],
                "correct_suggestion_position": corSugPositions[char_number],
            }
            record.update(trial_record)
            yield record


if __name__ == "__main__":
    header = list(chain(log_columns.keys(), other_columns))
    csv_export(
        json_logs_dir,
        output_file_path,
        header,
        iter_trials,
        iter_typing_tasks,
        participant_registry_path=None,
    )
    print("{} written.".format(output_file_path))
