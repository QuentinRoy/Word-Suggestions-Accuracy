import json
import csv
import os

def create_object(value):
    csv_obj = {
        'id': value["id"],
        'sentence': value["sentence"],
        'targetAccuracy': value["targetAccuracy"],
        'keyStrokeDelay': value["keyStrokeDelay"],
        'weightedAccuracy': value["weightedAccuracy"],
        'sentenceWordsAndSks': value["sentenceWordsAndSks"],
        'sdAccuracy': value["sdAccuracy"],
        'theoreticalSks': value["theoreticalSks"],
        'startDate': value["startDate"],
        'endDate': value["endDate"],
        'duration': value["duration"],
        'totalKeyStrokes': value["totalKeyStrokes"],
        'totalKeyStrokeErrors': value["totalKeyStrokeErrors"],
        'actualSks': value["actualSks"],
        'totalSuggestionUsed': value["totalSuggestionUsed"],
        'totalCorrectSuggestionUsed': value["totalCorrectSuggestionUsed"],
        'totalIncorrectSuggestionsUsed': value["totalIncorrectSuggestionsUsed"],
        'timeZone': value["timeZone"]
    }
    return csv_obj

def get_trials(data):
    trials = []
    for child in data["children"]:
        if "trial" in child:
            trials.append(child["trial"])
    return trials

if __name__ == "__main__":
    json_files_dir = "./participants-logs/"
    csv_file_path = "./trials.csv"
    with open(csv_file_path, 'w') as f:
        header = [
            "id",
            "sentence",
            "targetAccuracy",
            "keyStrokeDelay",
            "weightedAccuracy",
            "sentenceWordsAndSks",
            "sdAccuracy",
            "theoreticalSks",
            "startDate",
            "endDate",
            "duration",
            "totalKeyStrokes",
            "totalKeyStrokeErrors",
            "actualSks",
            "totalSuggestionUsed",
            "totalCorrectSuggestionUsed",
            "totalIncorrectSuggestionsUsed",
            "timeZone"
        ]
        writer = csv.DictWriter(f, header)
        writer.writeheader()

        for json_file in os.listdir(json_files_dir):
            fp = open(json_files_dir + json_file, 'r')
            json_value = fp.read()
            raw_data = json.loads(json_value)

            trials = get_trials(raw_data)

            for task in trials:
                csv_obj = create_object(task)
                writer.writerow(csv_obj)

            f.flush()
            fp.close()
        print ("Just completed writing csv file with %d columns" % len(header))
