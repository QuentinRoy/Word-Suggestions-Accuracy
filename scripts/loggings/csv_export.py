import json
import csv
import os
from registry import Registry


def null_iterator(log):
    yield log


def csv_export(
    json_logs_dir,
    output_file_path,
    header,
    reader,
    iterator=null_iterator,
    participant_registry_path=None,
    run_registry_path=None,
    log_progress=lambda x: None,
):

    p_registry = (
        Registry(
            participant_registry_path,
            input_col_name="worker_id",
            output_col_name="participant_id",
            id_prefix="P",
        )
        if participant_registry_path
        else None
    )

    r_registry = (
        Registry(
            run_registry_path,
            input_col_name="run_id",
            output_col_name="anonymized_run_id",
            id_prefix="R",
        )
        if run_registry_path
        else None
    )

    def encrypt_participant(row):
        if not p_registry or not "participant" in row:
            return row
        new_row = row.copy()
        new_row["participant"] = p_registry.get(row["participant"])
        return new_row

    def encrypt_run_id(row):
        if not r_registry or not "run_id" in row:
            return row
        new_row = row.copy()
        new_row["run_id"] = r_registry.get(row["run_id"])
        return new_row

    def map_row(row):
        row = encrypt_run_id(row)
        row = encrypt_participant(row)
        return row

    with open(output_file_path, "w") as log_file:
        writer = csv.DictWriter(log_file, header, quoting=csv.QUOTE_NONNUMERIC)
        writer.writeheader()
        row_num = 0
        log_progress(row_num)
        for p_file_name in os.listdir(json_logs_dir):
            if not os.path.splitext(p_file_name)[1].lower() == ".json":
                continue
            file_path = os.path.join(json_logs_dir, p_file_name)
            with open(file_path, "r") as participant_file:
                log = json.loads(participant_file.read())
                for record in iterator(log):
                    for row in reader(record, file_name=p_file_name):
                        row_num += 1
                        writer.writerow(map_row(row))
                        log_progress(row_num)

    if p_registry is not None:
        p_registry.close()
