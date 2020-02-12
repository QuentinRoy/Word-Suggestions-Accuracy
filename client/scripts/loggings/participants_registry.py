import csv
import os

FIELD_NAMES = ["worker_id", "participant_id"]


class ParticipantsRegistry:
    def __init__(self, registry_path):
        self._map = {}
        self._next_id = 0
        does_file_exists = os.path.exists(registry_path)
        if does_file_exists:
            self._file = open(registry_path, "r+")
            self._load()
        else:
            self._file = open(registry_path, "w")
        self._writer = csv.DictWriter(self._file, fieldnames=FIELD_NAMES)
        if not does_file_exists:
            self._writer.writeheader()

    def _load(self):
        for row in csv.DictReader(self._file):
            self._map[row["worker_id"]] = row["participant_id"]

    def get_next_id(self):
        id = "P{}".format(self._next_id)
        while id in self._map.values():
            self._next_id += 1
            id = "P{}".format(self._next_id)
        self._next_id += 1
        return id

    def get(self, worker_id):
        participant_id = self._map.get(worker_id, None)
        if participant_id is None:
            participant_id = self.get_next_id()
            self._map[worker_id] = participant_id
            self._writer.writerow(
                {"worker_id": worker_id, "participant_id": participant_id}
            )
        return participant_id

    def close(self):
        self._file.close()

