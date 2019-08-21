def to_snake_case(str):
    result = ""
    for c in str:
        if c.isupper():
            result += "_"
        result += c.lower()
    return result


def copy_rename(source, target, map):
    for (target_name, source_name) in map.items():
        if source_name in source:
            target[target_name] = source[source_name]
