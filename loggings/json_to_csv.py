import json
import csv
import os

def getText(trial):
    text = ''
    for i in range(len(trial["words"])):
        if(i == 0):
            text = trial["words"][i]["word"]
        else:
            text = text + " " + trial["words"][i]["word"]
    return text

def create_object(value):
    rows = []
    sentence = getText(value)
    for child in value["events"]:
        csv_obj = {
            'text': sentence,
            'accuracy': value["weightedAccuracy"],
            'key': value["key"],
            'event' :  child["event"],
            'added_input': child["addedInput"],
            'removed_input' :  child["removedInput"],
            'input': child["input"],
            'is_error' :  child["isError"],
            'suggestion_1': child["suggestion1"],
            'suggestion_2' :  child["suggestion2"],
            'suggestion_3': child["suggestion3"],
            'suggestion_used' :  child["suggestionUsed"],
            'total_correct_characters': child["totalCorrectCharacters"],
            'total_incorrect_characters' :  child["totalIncorrectCharacters"],
            'total_sentence_characters': child["totalSentenceCharacters"],
            'time' : child["time"]
        }
        rows.append(csv_obj)
    return rows


def get_typing_tasks(data):
    tasks = []
    for child in data["children"]:
        if "task" in child and child["task"] == "TypingTask":
            tasks.append(child)
    return tasks

if __name__ == "__main__":
    json_files_dir = "./participants-logs/"
    csv_file_path = "./csvlog.csv"
    with open(csv_file_path, 'w') as f:
        header = [
            "text",
            "accuracy",
            "key",
            "event",
            "added_input",
            "removed_input",
            "input",
            "is_error",
            "suggestion_1",
            "suggestion_2",
            "suggestion_3",
            "suggestion_used",
            "total_correct_characters",
            "total_incorrect_characters",
            "total_sentence_characters",
            "time",
        ]
        writer = csv.DictWriter(f, header)
        writer.writeheader()

        for json_file in os.listdir(json_files_dir):
            fp = open(json_files_dir + json_file, 'r')
            json_value = fp.read()
            raw_data = json.loads(json_value)

            typing_tasks = get_typing_tasks(raw_data)

            for task in typing_tasks:
                csv_obj = create_object(task)
                for row in csv_obj:
                    writer.writerow(row)

            f.flush()
            fp.close()
        print ("Just completed writing csv file with %d columns" % len(header))
