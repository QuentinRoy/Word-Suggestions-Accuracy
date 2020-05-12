const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");
const log = require("loglevel");

const configsPath = path.join(__dirname, "../public/configs");
const multiDevicePath = path.join(__dirname, "../logs/multi-device");
const multiDeviceTypingPath = path.join(
  __dirname,
  "../logs/multi-device-typing"
);

async function readJSONFile(filePath) {
  const data = await fs.readFile(filePath);
  return JSON.parse(data.toString());
}

async function getDirJSONs(
  dir,
  transform = (x) => x,
  filterPath = (filePath) => path.extname(filePath) === ".json"
) {
  const files = await fs.readdir(dir);
  return Promise.all(
    files
      .map((fileName) => path.join(dir, fileName))
      .filter(filterPath)
      .map((filePath) => readJSONFile(filePath).then(transform))
  );
}

function checkConfigs(configs) {
  const first = configs[0];
  configs.forEach((c) => {
    ["config", "targetAccuracy", "wave"].forEach((prop) => {
      if (c[prop] !== first[prop]) {
        log.warn(`Config group (${first.config}) has different ${prop}`);
      }
    });
  });
}

const participantsFixMap = { "1": "P1" };
function fixParticipantId(pid) {
  return participantsFixMap[pid] ?? pid;
}

async function getConfigConditions() {
  const deviceConfigs = await getDirJSONs(configsPath, (data) =>
    _.pick(
      data,
      "config",
      "device",
      "wave",
      "targetAccuracy",
      "configGenerationDate"
    )
  );
  const prodDeviceConfigs = deviceConfigs.filter((c) => c.wave !== "test");
  const groups = _.groupBy(prodDeviceConfigs, "config");
  return Object.values(groups).map((groupConfigs) => {
    checkConfigs(groupConfigs);
    return _.omit(groupConfigs[0], "device");
  });
}

function getRuns() {
  return getDirJSONs(multiDevicePath, (data) => ({
    participant: fixParticipantId(data.participant),
    ..._.pick(
      data,
      "config",
      "wave",
      "version",
      "gitSha",
      "device",
      "isTest",
      "targetAccuracy",
      "configGenerationDate"
    ),
  }));
}

function getTypingSpeedTaskSpeed(task) {
  const n = task.phrase.length;
  const firstEvent = task.events.find((evt) => evt.input !== "");
  const lastEvent = task.events.find((evt) => evt.input === task.phrase);
  return (1000 * n) / (new Date(lastEvent.time) - new Date(firstEvent.time));
}

function average(list) {
  return list.reduce((a, b) => a + b) / list.length;
}

function getTypingRuns() {
  return getDirJSONs(multiDeviceTypingPath, (data) => {
    const speeds = data.children
      .filter((node) => node.task === "TypingSpeedTask")
      .map(getTypingSpeedTaskSpeed);
    const averageSpeed = average(speeds);
    return {
      participant: fixParticipantId(data.participant),
      ..._.pick(data, "wave", "version", "device", "isTest", "gitSha"),
      averageSpeed,
    };
  });
}

function groupParticipantRuns(runs) {
  const commonProps = [
    "config",
    "version",
    "isTest",
    "gitSha",
    "participant",
    "targetAccuracy",
    "configGenerationDate",
  ];

  // Check any inconsistency in participant's runs.
  for (let i = 0; i < commonProps.length; i += 1) {
    const propName = commonProps[i];
    for (let j = 0; j < runs.length; j += 1) {
      const run = runs[j];
      if (run[propName] !== runs[0][propName]) {
        log.warn(
          `Different ${propName} value for ${runs[0].participant}: ${runs.map(
            (r) => r[propName]
          )}`
        );
        break;
      }
    }
  }

  const devices = _(runs)
    .groupBy("device")
    .mapValues((v) => {
      if (v.length > 1) {
        log.warn(
          `More than one run for ${v[0].participant} and device ${v[0].device}`
        );
      }
      return v[0];
    })
    .value();

  ["laptop", "phone", "tablet"].forEach((device) => {
    if (devices[device] == null) {
      log.warn(`${runs[0].participant} has no ${device} run`);
    }
  });

  return {
    ..._.pick(runs[0], ...commonProps),
    devices,
  };
}

const brokenParticipants = ["P1"];

function groupRuns(runs) {
  return _(runs).groupBy("participant").mapValues(groupParticipantRuns).value();
}

async function getParticipants() {
  const [typingRuns, runs] = await Promise.all([getTypingRuns(), getRuns()]);
  const groupedTypingRuns = groupRuns(
    typingRuns.filter((p) => !brokenParticipants.includes(p.participant))
  );
  const groupedRuns = groupRuns(
    runs.filter((p) => !brokenParticipants.includes(p.participant))
  );
  return Object.values(groupedRuns).map((value) => ({
    ..._.omit(value, "devices"),
    typingSpeed: _.mapValues(
      groupedTypingRuns[value.participant].devices,
      (d) => d.averageSpeed
    ),
  }));
}

async function getCompletion() {
  const [participants, configConditions] = await Promise.all([
    getParticipants(),
    getConfigConditions(),
  ]);
  const commonProps = ["targetAccuracy"];
  const mappedParticipants = [];
  const doneConfigs = [];
  for (let i = 0; i < configConditions.length; i += 1) {
    const c = configConditions[i];
    const configParticipants = participants.filter(
      (p) =>
        p.config === c.config &&
        c.configGenerationDate === p.configGenerationDate
    );
    if (configParticipants.length === 0) {
      doneConfigs.push(c);
    } else {
      if (configParticipants.length > 1) {
        log.warn(
          `${configParticipants.length} participants did config ${c.config}`
        );
      }
      const p = configParticipants[0];
      let isBroken = false;
      commonProps.forEach((propName) => {
        if (p[propName] !== c[propName]) {
          log.warn(
            `Config ${c.config} and participant ${p.participant} has mismatched ${propName}`
          );
          isBroken = true;
        }
      });
      if (isBroken) {
        doneConfigs.push(c);
      } else {
        mappedParticipants.push(p);
        doneConfigs.push({ ...c, ...p });
      }
    }
  }

  const missing = participants.filter((p) => !mappedParticipants.includes(p));

  if (missing.length > 0) {
    log.warn(
      `${
        missing.length
      } participant(s) had no corresponding configs: ${missing.map(
        (p) => p.participant
      )}`
    );
  }

  return doneConfigs;
}

getCompletion()
  .then((r) => console.log(JSON.stringifymin(r, null, 2)))
  .catch(console.error);
