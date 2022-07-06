import json
import csv
import os
from participants_registry import ParticipantsRegistry


def null_iterator(log):
    yield log


def csv_export(
    json_logs_dir,
    output_file_path,
    header,
    reader,
    iterator=null_iterator,
    participant_registry_path=None,
    log_progress=lambda x: None,
):

    p_registry = (
        ParticipantsRegistry(participant_registry_path)
        if participant_registry_path
        else None
    )

    def encrypt_participant(row):
        if not p_registry or not "participant" in row:
            return row
        new_row = row.copy()
        new_row["participant"] = p_registry.get(row["participant"])
        return new_row

    with open(output_file_path, "w") as log_file:
        writer = csv.DictWriter(log_file, header, quoting=csv.QUOTE_NONNUMERIC)
        writer.writeheader()
        line_num = 0
        log_progress(line_num)
        for p_file_name in os.listdir(json_logs_dir):
            if not os.path.splitext(p_file_name)[1].lower() == ".json":
                continue
            with open(
                os.path.join(json_logs_dir, p_file_name), "r"
            ) as participant_file:
                log = json.loads(participant_file.read())
                for record in iterator(log):
                    for row in reader(record, file_name=p_file_name):
                        writer.writerow(encrypt_participant(row))
                        line_num += 1
                        log_progress(line_num)

    if p_registry is not None:
        p_registry.close()
