const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");
const papaparse = require("papaparse");
const { snakeCase } = require("change-case");

const configsPath = path.join(__dirname, "../public/configs");

const columns = [
  "config",
  "runUuid",
  "configUuid",
  "device",
  "wave",
  "targetAccuracy",
  "deviceOrder",
  "configGenerationDate",
  "configGenerationVersion",
  "configGenerationGitSha",
  "minSuggestionsDelay",
  "keyStrokeDelay",
  "totalSuggestions",
];

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

async function getConfigs() {
  const deviceConfigs = await getDirJSONs(configsPath, (data) =>
    _({ ...data, deviceOrder: data.deviceOrder.indexOf(data.device) })
      .pick(...columns)
      .mapKeys((v, k) => snakeCase(k))
      .value()
  );
  return papaparse.unparse(deviceConfigs, { columns: columns.map(snakeCase) });
}

getConfigs()
  .then((data) => {
    process.stdout.write(data);
    process.exit(0);
  })
  .catch((error) => {
    process.stderr.write(error.message);
    process.exit(1);
  });
