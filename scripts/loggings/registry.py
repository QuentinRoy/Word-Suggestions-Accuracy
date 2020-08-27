import csv
import os


class Registry:
    def __init__(self, registry_path, input_col_name, output_col_name, id_prefix=""):
        self._map = {}
        self._next_id = 0
        self._input_col_name = input_col_name
        self._output_col_name = output_col_name
        self._id_prefix = id_prefix
        does_file_exists = os.path.exists(registry_path)
        if does_file_exists:
            self._file = open(registry_path, "r+")
            self._load()
        else:
            self._file = open(registry_path, "w")
        self._writer = csv.DictWriter(
            self._file, fieldnames=[self._input_col_name, self._output_col_name]
        )
        if not does_file_exists:
            self._writer.writeheader()

    def _load(self):
        for row in csv.DictReader(self._file):
            self._map[row[self._input_col_name]] = row[self._output_col_name]

    def get_next_id(self):
        id = "{}{}".format(self._id_prefix, self._next_id)
        while id in self._map.values():
            self._next_id += 1
            id = "{}{}".format(self._id_prefix, self._next_id)
        self._next_id += 1
        return id

    def get(self, input_id):
        output_id = self._map.get(input_id, None)
        if output_id is None:
            output_id = self.get_next_id()
            self._map[input_id] = output_id
            row = {}
            row[self._input_col_name] = input_id
            row[self._output_col_name] = output_id
            self._writer.writerow(row)
        return output_id

    def close(self):
        self._file.close()

