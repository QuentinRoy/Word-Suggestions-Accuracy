const AWS = require("aws-sdk");
const fs = require("fs-extra");
const path = require("path");
const sanitizeFileName = require("sanitize-filename");
const last = require("lodash/last");
const log = require("loglevel");
const meow = require("meow");

log.setDefaultLevel(log.levels.INFO);

const defaultBucket = "exii-accuracy-control-uploads";

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

const Actions = Object.freeze({
  downloaded: Symbol("downloaded"),
  updated: Symbol("updated"),
  skipped: Symbol("skipped"),
});

async function downloadObject(
  { key, targetFileName, modificationDate },
  { shouldOverwrite = false, bucket }
) {
  // const exists = await fileExists(targetFileName);
  // const mDate = exists && (await fileLastModifiedDate());
  const doesFileExists = await fileExists(targetFileName);
  if (
    !shouldOverwrite &&
    doesFileExists &&
    (await fileLastModifiedDate(targetFileName)) > modificationDate
  ) {
    return Actions.skipped;
  }
  const resp = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  const content = resp.Body.toString();
  await fs.writeFile(targetFileName, content);
  if (doesFileExists) {
    log.info(`${targetFileName} updated.`);
    return Actions.updated;
  }
  log.info(`${key} downloaded in ${targetFileName}.`);
  return Actions.downloaded;
}

async function downloadObjects(objectEntries, options) {
  return Promise.all(
    objectEntries.map(({ key, targetFileName, modificationDate }) =>
      downloadObject(
        { key, targetFileName, modificationDate },
        options
      ).then((action) => ({ key, targetFileName, modificationDate, action }))
    )
  );
}

async function doMain(opts) {
  // Do not spread from the arguments to keep the opts parameter because we
  // re-use it when calling doMain again.
  const {
    startAfter = undefined,
    overwrite: shouldOverwrite = false,
    bucket,
    output: outputDir,
    input: objectsRemoteDirectory,
  } = opts;
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
      MaxKeys: 100,
    })
    .promise();

  // Create a map of object keys to the file they should be downloaded to.
  const toDlKeyFileMap = listObjRequest.Contents.map((o) => ({
    key: o.Key,
    targetFileName: path.join(outputDir, getObjectFileName(o)),
    modificationDate: o.LastModified,
  }));

  if (listObjRequest.IsTruncated) {
    return Promise.all([
      downloadObjects(toDlKeyFileMap, { shouldOverwrite, bucket }),
      doMain({ ...opts, startAfter: last(listObjRequest.Contents).Key }),
    ]).then((results) => results.flat());
  }
  return downloadObjects(toDlKeyFileMap, { shouldOverwrite, bucket });
}

async function main(options) {
  const fileActions = await doMain(options);
  const counts = fileActions.reduce(
    (acc, { action }) => ({
      ...acc,
      [action]: acc[action] + 1,
    }),
    { [Actions.downloaded]: 0, [Actions.skipped]: 0, [Actions.updated]: 0 }
  );
  log.info(
    `${
      counts[Actions.downloaded]
    } file(s) have been downloaded for the first time.`
  );
  log.info(`${counts[Actions.updated]} files(s) have been updated.`);
  log.info(
    `${counts[Actions.skipped]} files(s) have not been downloaded again.`
  );
}

if (require.main === module) {
  const { flags, showHelp } = meow(
    `
      Usage
        $ node download-logs.js -i <remote-dir> -o <output-dir>

      Options:
        --bucket, -b    AWS bucket. Default: ${defaultBucket}.
                                                                        [string]
        --input, -i     The AWS bucket directory to download.           [string]
        --output, -o    The directory where to put the downloaded files.
                                                                        [string]
        --overwrite, -w True if already downloaded logs should be overwritten
                        even when the remote log is not more recent.   
                        Default: false.                                [boolean]

      Example:
        $ node download-logs.js -i prod -o logs/multi-device
    `,
    {
      description: false,
      booleanDefault: false,
      flags: {
        bucket: { type: "string", alias: "b", default: defaultBucket },
        input: { type: "string", alias: "i" },
        output: { type: "string", alias: "o" },
        overwrite: { type: "boolean", alias: "w", default: false },
      },
    }
  );

  if (flags.input == null || flags.output == null) {
    process.stderr.write("ERROR: You must provide an input and an output");
    // Show the help and exit.
    showHelp();
  }

  main(flags).catch((err) => {
    log.error(err);
    process.exit(1);
  });
}
