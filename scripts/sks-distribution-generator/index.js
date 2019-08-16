const fs = require("fs");
const path = require("path");
const log = require("loglevel");
const { getWordAccuracies } = require("./wordAccuracies");

log.setDefaultLevel(log.levels.INFO);

const configs = (() => {
  const targetSd = 0.25;
  const maxDiffAccuracy = 0.025;
  const maxDiffSd = 0.1;
  return [
    { targetAccuracy: 0, targetSd: 0, maxDiffAccuracy, maxDiffSd },
    ...[0.25, 0.5, 0.75].map(targetAccuracy => ({
      targetAccuracy,
      targetSd,
      maxDiffAccuracy,
      maxDiffSd
    })),
    { targetAccuracy: 1, targetSd: 0, maxDiffAccuracy, maxDiffSd }
  ];
})();

const addUnusableSentences = false;

const sentencesPath = path.join(__dirname, "../../public/sentences.txt");
const outputDirPath = path.join(__dirname, "../../public/sks-distributions");
const targetFilePrefix = "acc-";

const getTargetFileName = accuracy =>
  `${targetFilePrefix}${accuracy.toFixed(3)}.json`;

const file = fs.readFileSync(sentencesPath, "utf-8", (err, data) => {
  if (err) throw err;
  return data;
});

const sentences = file
  .split("\n")
  .map(s => s.trim())
  .filter(s => s !== "");

log.info(`${sentences.length} sentences found in ${sentencesPath}.`);

if (!fs.existsSync(outputDirPath)) {
  fs.mkdirSync(outputDirPath);
}

configs.forEach(config => {
  log.info(
    `Creating saved key strokes distributions for accuracy ${config.targetAccuracy} (targetSd: ${config.targetSd}, maxDiffAccuracy: ${config.maxDiffAccuracy}, maxDiffSd: ${config.maxDiffSd})`
  );
  const rows = [];

  let totalUsableSentences = 0;

  for (let sIdx = 0; sIdx < sentences.length; sIdx += 1) {
    const accuracyDistribution = getWordAccuracies(sentences[sIdx], config);
    const usable =
      accuracyDistribution.diffAccuracy <= config.maxDiffAccuracy &&
      accuracyDistribution.diffSd <= config.maxDiffSd;
    if (usable || addUnusableSentences) {
      totalUsableSentences += 1;
      rows.push({
        meanAccuracy: accuracyDistribution.meanAccuracy,
        weightedAccuracy: accuracyDistribution.weightedAccuracy,
        sdAccuracy: accuracyDistribution.sdAccuracy,
        words: accuracyDistribution.words,
        diffAccuracy: accuracyDistribution.diffAccuracy,
        diffSd: accuracyDistribution.diffSd,
        usable
      });
    }
  }

  const jsonFile = JSON.stringify({ ...config, rows });
  const targetFile = path.join(
    outputDirPath,
    getTargetFileName(config.targetAccuracy)
  );
  fs.writeFileSync(targetFile, jsonFile, "utf8");
  log.info(
    `${totalUsableSentences} usable sentences written in ${targetFile}!`
  );
});
