const targetAccuracy = [0, 0.25, 0.5, 0.75, 1];
const targetSd = 0;
const maxSd = 0.1;
const maxDiffAccuracy = 0.1;

const fs = require("fs");
const { getWordAccuracies } = require("./wordAccuracies");

const fileURL = new URL(
  "file:///Users/sebastien/accuracy_autocorrect/public/phrases.txt"
);

const file = fs.readFileSync(fileURL, "utf-8", (err, data) => {
  if (err) throw err;
  return data;
});

const parsedFile = file
  .split("\n")
  .map(s => s.trim())
  .filter(s => s !== "");

for (let a = 0; a < targetAccuracy.length; a += 1) {
  console.log(targetAccuracy[a]);
  const rows = [];

  for (let i = 0; i < parsedFile.length; i += 1) {
    const accuracyDistribution = getWordAccuracies(
      parsedFile[i],
      targetAccuracy[a],
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
      usable: accuracyDistribution.diffAccuracy <= maxDiffAccuracy
    });
  }

  const jsonFile = JSON.stringify(rows);
  fs.writeFile(
    `accuraciesDistribution${targetAccuracy[a]}.json`,
    jsonFile,
    "utf8",
    err => {
      if (err) throw err;
      console.log(
        `The file accuraciesDistribution${targetAccuracy[a]}.json has been saved!`
      );
    }
  );
}
