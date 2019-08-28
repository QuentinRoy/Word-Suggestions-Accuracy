import json
import csv
import os


def null_iterator(log):
    yield log


def csv_export(json_logs_dir, output_file_path, header, reader, iterator=null_iterator):
    with open(output_file_path, "w") as log_file:
        writer = csv.DictWriter(log_file, header, quoting=csv.QUOTE_NONNUMERIC)
        writer.writeheader()

        for p_file_name in os.listdir(json_logs_dir):
            if not os.path.splitext(p_file_name)[1].lower() == ".json":
                continue
            with open(
                os.path.join(json_logs_dir, p_file_name), "r"
            ) as participant_file:
                log = json.loads(participant_file.read())
                for record in iterator(log):
                    writer.writerows(reader(record, file_name=p_file_name))
            # Make sure the buffer does not go crazy.
            log_file.flush()
