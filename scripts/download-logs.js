const AWS = require("aws-sdk");
const fs = require("fs-extra");
const path = require("path");
const sanitizeFileName = require("sanitize-filename");
const last = require("lodash/last");
const fromPairs = require("lodash/fromPairs");
const log = require("loglevel");

log.setDefaultLevel(log.levels.INFO);

const bucket = "exii-accuracy-control-uploads";
const objectsRemoteDirectory = "prod/";
const outputDir = path.join(__dirname, "../participants-logs");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

function getObjectFileName(obj) {
  return sanitizeFileName(path.basename(obj.Key), { replacement: "-" });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath, fs.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

async function downloadObject(key, targetFilePath, shouldOverwrite = false) {
  if (!shouldOverwrite && (await fileExists(targetFilePath))) {
    log.info(`Skipping ${key}. File already exist.`);
    return;
  }
  const resp = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  const content = resp.Body.toString();
  await fs.writeFile(targetFilePath, content);
  log.info(`${key} downloaded in ${targetFilePath}.`);
}

async function downloadObjects(keyFileMap, shouldOverwrite) {
  return Promise.all(
    Object.entries(keyFileMap).map(([key, fileName]) =>
      downloadObject(key, fileName, shouldOverwrite)
    )
  );
}

async function main({ startAfter = undefined, shouldOverwrite = false } = {}) {
  try {
    await fs.mkdir(outputDir);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  const listObjRequest = await s3
    .listObjectsV2({
      Bucket: bucket,
      StartAfter: startAfter,
      Prefix: objectsRemoteDirectory,
      MaxKeys: 50
    })
    .promise();

  // Create a map of object keys to the file they should be downloaded to.
  const toDlKeyFileMap = fromPairs(
    listObjRequest.Contents.map(o => [
      o.Key,
      path.join(outputDir, getObjectFileName(o))
    ])
  );

  if (listObjRequest.IsTruncated) {
    await Promise.all([
      downloadObjects(toDlKeyFileMap),
      main({ startAfter: last(listObjRequest.Contents).Key, shouldOverwrite })
    ]);
  } else {
    await downloadObjects(toDlKeyFileMap, shouldOverwrite);
  }
}

if (require.main === module) {
  main().catch(err => log.error(err));
}
