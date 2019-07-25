const fs = require("fs");
const path = require("path");
const { getWordAccuracies } = require("./wordAccuracies");

const targetAccuracies = [0, 0.25, 0.5, 0.75, 1];
const targetSd = 0;
const maxSd = 0.1;
const maxDiffAccuracy = 0.05;
const addUnusableSentences = false;

const sentencesPath = path.join(__dirname, "./sentences.txt");
const outputDirPath = path.join(__dirname, "../public/sks-distributions");
const targetFilePrefix = "acc-";

const getTargetFileName = accuracy => `${targetFilePrefix}${accuracy}.json`;

const file = fs.readFileSync(sentencesPath, "utf-8", (err, data) => {
  if (err) throw err;
  return data;
});

const sentences = file
  .split("\n")
  .map(s => s.trim())
  .filter(s => s !== "");

console.log(`${sentences.length} sentences found in ${sentencesPath}.`);

if (!fs.existsSync(outputDirPath)) {
  fs.mkdirSync(outputDirPath);
}

for (let aIdx = 0; aIdx < targetAccuracies.length; aIdx += 1) {
  console.log(
    `Creating saved key strokes distributions for accuracy ${targetAccuracies[aIdx]}...`
  );
  const rows = [];

  let totalUsableSentences = 0;

  for (let sIdx = 0; sIdx < sentences.length; sIdx += 1) {
    const accuracyDistribution = getWordAccuracies(
      sentences[sIdx],
      targetAccuracies[aIdx],
      targetSd,
      maxSd
    );
    const usable = accuracyDistribution.diffAccuracy <= maxDiffAccuracy;
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

  const jsonFile = JSON.stringify(rows);
  const targetFile = path.join(
    outputDirPath,
    getTargetFileName(targetAccuracies[aIdx])
  );
  fs.writeFileSync(targetFile, jsonFile, "utf8");
  console.log(
    `${totalUsableSentences} usable sentences written in ${targetFile}!`
  );
}
