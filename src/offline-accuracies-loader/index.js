const targetAccuracy = 0.5;
const targetSd = 0;
const maxSd = 0.1;
const maxDiffAccuracy = 0.1;

const fs = require("fs");
const { getWordAccuracies } = require("./wordAccuracies");

const fileURL = new URL(
  "file:///Users/sebastien/accuracy_autocorrect/public/phrases.txt"
);

const rows = [];

const file = fs.readFileSync(fileURL, "utf-8", (err, data) => {
  if (err) throw err;
  return data;
});

const parsedFile = file
  .split("\n")
  .map(s => s.trim())
  .filter(s => s !== "");

for (let i = 0; i < parsedFile.length; i += 1) {
  const accuracyDistribution = getWordAccuracies(
    parsedFile[i],
    targetAccuracy,
    targetSd,
    maxSd
  );
  rows.push({
    meanAccuracy: accuracyDistribution.meanAccuracy.toFixed(2),
    weightedAccuracy: accuracyDistribution.weightedAccuracy.toFixed(2),
    sdAccuracy: accuracyDistribution.sdAccuracy.toFixed(2),
    words: accuracyDistribution.words,
    diffAccuracy: accuracyDistribution.diffAccuracy.toFixed(2),
    diffSd: accuracyDistribution.diffSd.toFixed(2),
    usable: accuracyDistribution.diffAccuracy > maxDiffAccuracy
  });
}

const jsonl = JSON.stringify(rows);
fs.writeFile("accuraciesDistribution.jsonl", jsonl, "utf8", err => {
  if (err) throw err;
  console.log("The file has been saved!");
});
