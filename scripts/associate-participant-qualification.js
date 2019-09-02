const AWS = require("aws-sdk");
const fs = require("fs-extra");
const path = require("path");
const log = require("loglevel");

const region = "us-east-1";
const endPoint = "https://mturk-requester.us-east-1.amazonaws.com";

// This is copied from https://requester.mturk.com/qualification_types.
const qualificationId = "35NJKTSSL07RM0ZERKYKLTJOICJXZL";
const logDirPath = path.join(__dirname, "../participants-logs");

log.setDefaultLevel(log.levels.INFO);
AWS.config.update({ region, endpoint: endPoint });

const mturk = new AWS.MTurk({ apiVersion: "2017-01-17" });

async function associateQualification(workerId) {
  const resp = await mturk
    .associateQualificationWithWorker({
      QualificationTypeId: qualificationId /* required */,
      WorkerId: workerId /* required */,
      IntegerValue: 1,
      SendNotification: false
    })
    .promise();
  log.debug(resp);
}

async function getWorkerIdFromLog(logFilePath) {
  const contentBuffer = await fs.readFile(logFilePath);
  const content = JSON.parse(contentBuffer.toString());
  return content.participant;
}

async function getAllQualificationWorkers({ nextToken, acc = new Set() } = {}) {
  const resp = await mturk
    .listWorkersWithQualificationType({
      QualificationTypeId: qualificationId,
      MaxResults: 100,
      NextToken: nextToken
    })
    .promise();

  resp.Qualifications.filter(q => q.Status === "Granted").forEach(q => {
    acc.add(q.WorkerId);
  });

  if (resp.NextToken == null) return acc;

  return getAllQualificationWorkers({ nextToken: resp.NextToken, acc });
}

const Actions = {
  notWorker: Symbol("not a worker"),
  hasQualif: Symbol("already has the qualification"),
  associated: Symbol("associated with the qualification")
};

async function main() {
  const workersWithQualif = await getAllQualificationWorkers();
  const logFiles = await fs.readdir(logDirPath);
  const results = await Promise.all(
    logFiles
      .filter(fileName => path.extname(fileName).toLowerCase() === ".json")
      .map(async fileName => {
        const workerId = await getWorkerIdFromLog(
          path.join(logDirPath, fileName)
        );
        if (!/^A[A-Z0-9]+$/.test(workerId)) {
          return Actions.notWorker;
        }
        if (workersWithQualif.has(workerId)) {
          return Actions.hasQualif;
        }
        await associateQualification(workerId);
        log.info("Qualification associated with", workerId);
        return Actions.associated;
      })
  );
  const totalSkipped = results.reduce(
    (count, r) => (r === Actions.hasQualif ? count + 1 : count),
    0
  );
  const totalNotWorker = results.reduce(
    (count, r) => (r === Actions.notWorker ? count + 1 : count),
    0
  );
  log.info(
    `${totalSkipped} worker(s) were not associated with the qualification again.`
  );
  log.info(`${totalNotWorker} log(s) did not correspond to a worker id.`);
}

if (require.main === module) {
  main().catch(err => log.error(err));
}
