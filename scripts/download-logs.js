const AWS = require("aws-sdk");
const fs = require("fs-extra");
const path = require("path");
const sanitizeFileName = require("sanitize-filename");
const last = require("lodash/last");
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

async function fileLastModifiedDate(filePath) {
  const stats = await fs.stat(filePath);
  return new Date(stats.mtime);
}

async function downloadObject({
  key,
  targetFileName,
  modificationDate,
  shouldOverwrite = false
}) {
  // const exists = await fileExists(targetFileName);
  // const mDate = exists && (await fileLastModifiedDate());
  if (
    !shouldOverwrite &&
    (await fileExists(targetFileName)) &&
    (await fileLastModifiedDate(targetFileName)) > modificationDate
  ) {
    log.info(`Skipping ${key}. File already exists and is more recent.`);
    return;
  }
  const resp = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  const content = resp.Body.toString();
  await fs.writeFile(targetFileName, content);
  log.info(`${key} downloaded in ${targetFileName}.`);
}

async function downloadObjects(objectEntries, shouldOverwrite) {
  return Promise.all(
    objectEntries.map(({ key, targetFileName, modificationDate }) =>
      downloadObject({ key, targetFileName, modificationDate, shouldOverwrite })
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
  const toDlKeyFileMap = listObjRequest.Contents.map(o => ({
    key: o.Key,
    targetFileName: path.join(outputDir, getObjectFileName(o)),
    modificationDate: o.LastModified
  }));

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
