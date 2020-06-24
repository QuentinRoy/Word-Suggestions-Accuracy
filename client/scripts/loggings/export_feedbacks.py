import json
import csv
import os
from config_tasks import (
    iter_task_of_type,
    FINAL_FEEDBACKS,
    DEMOGRAPHIC_QUESTIONNAIRE,
    BLOCK_QUESTIONNAIRE,
    STARTUP,
    CONSENT_FORM,
    MEASURE_DISPLAY,
)

this_dir = os.path.dirname(os.path.abspath(__file__))
json_logs_dir = os.path.join(this_dir, "../../logs/multi-device/")
output_file_path = os.path.abspath(os.path.join(json_logs_dir, "feedbacks.md"))


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


if __name__ == "__main__":
    with open(output_file_path, "w") as log_file:
        for p_file_name in os.listdir(json_logs_dir):
            if not os.path.splitext(p_file_name)[1].lower() == ".json":
                continue
            with open(
                os.path.join(json_logs_dir, p_file_name), "r"
            ) as participant_file:
                log = json.loads(participant_file.read())
                feedback = get_feedbacks(log)
                participant = log["participant"]
                if feedback is not None and feedback.strip() != "":
                    log_file.write("# " + participant + "\n")
                    log_file.write(feedback.strip() + "\n\n")
