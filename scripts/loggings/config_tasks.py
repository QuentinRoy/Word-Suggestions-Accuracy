# All of this is unfortunately copied from src/utils/constants.js.
TYPING_TASK = "TypingTask"
S3_UPLOAD = "S3Upload"
END_EXPERIMENT = "EndExperiment"
STARTUP = "Startup"
END_QUESTIONNAIRE = "EndQuestionnaire"
TUTORIAL = "Tutorial"
CONSENT_FORM = "ConsentForm"
FINAL_FEEDBACKS = "FinalFeedbacks"
INJECT_END = "InjectEnd"
INFORMATION_SCREEN = "InformationScreen"
EXPERIMENT_PROGRESS = "ExperimentProgress"


INPUT_CHAR_EVENT = "INPUT_CHAR"
DELETE_CHAR_EVENT = "DELETE_CHAR"
INPUT_SUGGESTION_EVENT = "INPUT_SUGGESTION"
FOCUS_NEXT_EVENT = "FOCUS_NEXT"
TOGGLE_KEYBOARD_LAYOUT_EVENT = "TOGGLE_KEYBOARD_LAYOUT"
MOVE_FOCUS_TARGET_EVENT = "MOVE_FOCUS_TARGET"
WINDOW_BLURRED_EVENT = "WINDOW_BLURRED"
WINDOW_FOCUSED_EVENT = "WINDOW_FOCUSED"
CLOSE_FOCUS_ALERT_EVENT = "CLOSE_FOCUS_ALERT"
SUBMIT_EVENT = "SUBMIT"


def iter_config_tasks(config):
    properties = config.copy()

    if "children" not in config:
        yield properties
        return

    del properties["children"]

    for child in config["children"]:
        for sub_config in iter_config_tasks(child):
            yield {**properties, **sub_config}


def iter_task_of_type(log, task_type):
    for task in iter_config_tasks(log):
        if "task" in task and task["task"] == task_type:
            yield task


def iter_typing_tasks(log):
    yield from iter_task_of_type(log, TYPING_TASK)


def flatten_config(config):
    return list(iter_config_tasks(config))
