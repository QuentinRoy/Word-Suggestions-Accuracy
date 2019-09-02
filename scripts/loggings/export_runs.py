import json
import csv
import os
from csv_export import csv_export
from config_tasks import (
    iter_task_of_type,
    FINAL_FEEDBACKS,
    END_QUESTIONNAIRE,
    STARTUP,
    CONSENT_FORM,
)
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
        "timeZone",
        "userAgent",
        "confirmationCode",
        "wave",
    ]
)


corpus_columns = {
    "corpus_target_kss": "targetKss",
    "corpus_target_sd_words_kss": "targetSdWordsKss",
    "corpus_max_diff_kss": "maxDiffKss",
    "corpus_max_diff_sd_words_kss": "maxDiffSdWordsKss",
    "was_corpus_shuffled": "shuffled",
}

other_columns = [
    "file_name",
    "feedbacks",
    "start_up_questionnaire_trials",
    "accepted_consent_form",
]

end_questionnaire_columns = {
    "age": "age",
    "gender": "gender",
    "controls_satisfactory": "controlsSatisfactory",
    "suggestions_accuracy": "suggestionsAccuracy",
    "middle_answer": "middleAnswer",
    "keyboard_use_efficiency": "keyboardUseEfficiency",
    "suggestions_use_frequency_desktop": "suggestionsUseFrequencyDesktop",
    "suggestions_use_frequency_mobile": "suggestionsUseFrequencyMobile",
    "suggestion_distraction": "suggestionDistraction",
    "mental_demand": "mentalDemand",
    "physical_demand": "physicalDemand",
    "temporal_demand": "temporalDemand",
    "performance": "performance",
    "effort": "effort",
    "frustration": "frustration",
}


def get_feedbacks(run_record):
    feedback_tasks = list(iter_task_of_type(run_record, FINAL_FEEDBACKS))
    assert len(feedback_tasks) == 1
    if "feedbacks" in feedback_tasks[0]:
        return feedback_tasks[0]["feedbacks"]
    return None


def get_start_questionnaire_trials(run_record):
    startup_questionnaire_task = list(iter_task_of_type(run_record, STARTUP))
    assert len(startup_questionnaire_task) == 1
    if "trials" in startup_questionnaire_task[0]:
        return len(startup_questionnaire_task[0]["trials"])
    return 0


def get_end_questionnaire(run_record):
    end_questionnaire_task = list(iter_task_of_type(run_record, END_QUESTIONNAIRE))
    assert len(end_questionnaire_task) == 1
    if "log" in end_questionnaire_task[0]:
        return end_questionnaire_task[0]["log"]
    return {}


def accepted_consent_form(run_record):
    consent_form_task = list(iter_task_of_type(run_record, CONSENT_FORM))
    assert len(consent_form_task) == 1
    return "end" in consent_form_task[0]


# This should just yield once, but we still use an iterators for consistency
# with export_events.
def iter_run_record(run_record, file_name, **kwargs):
    result = {
        "file_name": file_name,
        "feedbacks": get_feedbacks(run_record),
        "start_up_questionnaire_trials": get_start_questionnaire_trials(run_record),
        "accepted_consent_form": accepted_consent_form(run_record),
    }
    copy_rename(run_record, result, record_columns)
    copy_rename(run_record["corpusConfig"], result, corpus_columns)
    copy_rename(get_end_questionnaire(run_record), result, end_questionnaire_columns)
    yield result


if __name__ == "__main__":
    header = (
        list(record_columns.keys())
        + list(corpus_columns.keys())
        + other_columns
        + list(end_questionnaire_columns.keys())
    )
    csv_export(json_logs_dir, output_file_path, header, iter_run_record)
    print("{} written.".format(output_file_path))
