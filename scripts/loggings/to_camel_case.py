def to_camel_case(str):
    result = ""
    for c in str:
        if c.isupper():
            result += "_"
        result += c.lower()
    return result
