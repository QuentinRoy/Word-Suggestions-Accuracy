import json
import csv
import os
from csv_export import csv_export
from config_tasks import (
    iter_task_of_type,
    FINAL_FEEDBACKS,
    DEMOGRAPHIC_QUESTIONNAIRE,
    BLOCK_QUESTIONNAIRE,
    STARTUP,
    CONSENT_FORM,
)
from utils import to_snake_case, copy_rename


this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../logs/multi-device/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "runs.csv"))
p_registry_path = os.path.abspath(os.path.join(json_logs_dir, "p_registry.csv"))

record_columns = dict(
    (to_snake_case(col), col)
    for col in [
        "participant",
        "corpusSize",
        "keyStrokeDelay",
        "targetAccuracy",
        "version",
        "totalSuggestions",
        "suggestionsType",
        "numberOfPracticeTasks",
        "numberOfTypingTasks",
        "startDate",
        "endDate",
        "timeZone",
        "wave",
        "config",
        "device",
        "gitSha",
        "href",
        "userAgent",
    ]
)


other_columns = ["feedbacks", "start_up_questionnaire_trials", "file_name"]

demo_questionnaire_columns = {
    "age": "age",
    "gender": "gender",
    "suggestions_use_frequency_desktop": "suggestionsUseFrequencyDesktop",
    "suggestions_use_frequency_phone": "suggestionsUseFrequencyPhone",
    "suggestions_use_frequency_tablet": "suggestionsUseFrequencyTablet",
}

block_questionnaire_columns = {
    "controls_satisfactory": "controlsSatisfactory",
    "suggestions_accuracy": "suggestionsAccuracy",
    "keyboard_use_efficiency": "keyboardUseEfficiency",
    "suggestion_distraction": "suggestionDistraction",
    "mental_demand": "mentalDemand",
    "physical_demand": "physicalDemand",
    "temporal_demand": "temporalDemand",
    "performance": "performance",
    "effort": "effort",
    "frustration": "frustration",
}


def use_one_task(task_type, is_one_required=False):
    def inject(func):
        def wrapper(run_record):
            tasks = list(iter_task_of_type(run_record, task_type))
            if not is_one_required and len(tasks) == 0:
                return func(None)
            assert len(tasks) == 1
            return func(tasks[0])

        return wrapper

    return inject


def get_task_prop(task, prop_name, default):
    if task is None or prop_name not in task:
        return default
    return task[prop_name]


@use_one_task(FINAL_FEEDBACKS)
def get_feedbacks(task):
    return get_task_prop(task, prop_name="feedbacks", default=None)


@use_one_task(STARTUP)
def get_start_questionnaire_trials(task):
    return len(get_task_prop(task, prop_name="feedbacks", default=[]))


@use_one_task(DEMOGRAPHIC_QUESTIONNAIRE)
def get_demographic_questionnaire(task):
    return get_task_prop(task, prop_name="log", default={})


@use_one_task(BLOCK_QUESTIONNAIRE)
def get_block_questionnaire(task):
    return get_task_prop(task, prop_name="log", default={})


# This should just yield once, but we still use an iterators for consistency
# with export_events.
def iter_run_record(run_record, file_name, **kwargs):
    result = {
        "feedbacks": get_feedbacks(run_record),
        "start_up_questionnaire_trials": get_start_questionnaire_trials(run_record),
        "file_name": file_name,
    }
    copy_rename(run_record, result, record_columns)
    copy_rename(
        get_demographic_questionnaire(run_record), result, demo_questionnaire_columns
    )
    copy_rename(
        get_block_questionnaire(run_record), result, block_questionnaire_columns
    )
    yield result


if __name__ == "__main__":
    header = (
        list(record_columns.keys())
        + other_columns
        + list(demo_questionnaire_columns.keys())
        + list(block_questionnaire_columns.keys())
    )
    csv_export(
        json_logs_dir,
        output_file_path,
        header,
        iter_run_record,
        participant_registry_path=None,
    )
    print("{} written.".format(output_file_path))
