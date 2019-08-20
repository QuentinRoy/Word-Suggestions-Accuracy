def iter_config_tasks(config):
    properties = config.copy()

    if "children" not in config:
        yield properties
        return

    del properties["children"]

    for child in config["children"]:
        for sub_config in iter_config_tasks(child):
            yield {**properties, **sub_config}


def iter_typing_tasks(log):
    for task in iter_config_tasks(log):
        if "task" in task and task["task"] == "TypingTask":
            yield task


def flatten_config(config):
    return list(iter_config_tasks(config))
