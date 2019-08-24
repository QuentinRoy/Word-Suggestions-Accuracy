const fs = require("fs-extra");
const path = require("path");
const log = require("loglevel");
const range = require("lodash/range");
const uniq = require("lodash/uniq");
const getWordAccuracies = require("./getWordAccuracies");

log.setDefaultLevel(log.levels.INFO);

const addUnusableSentences = false;

const sentencesPath = path.join(__dirname, "../../public/sentences.txt");
const outputDirPath = path.join(__dirname, "../../public/sks-distributions");
const targetFilePrefix = "acc-";

// { targetKss, targetSdWordsKss, maxDiffKss, maxDiffSdWordsKss }

const configs = (() => {
  const targetSdWordsKss = 0.2;
  const maxDiffKss = 0.025;
  const maxDiffSdWordsKss = 0.1;
  return [
    {
      targetKss: 0,
      targetSdWordsKss,
      maxDiffKss,
      maxDiffSdWordsKss: targetSdWordsKss
    },
    ...uniq([...range(0.1, 1, 0.2), ...range(0.25, 1, 0.25)]).map(
      targetKss => ({
        targetKss,
        targetSdWordsKss,
        maxDiffKss,
        maxDiffSdWordsKss
      })
    ),
    {
      targetKss: 1,
      targetSdWordsKss,
      maxDiffKss,
      maxDiffSdWordsKss: targetSdWordsKss
    }
  ];
})();

const getTargetFileName = kss => `${targetFilePrefix}${kss.toFixed(3)}.json`;

const generateDistribution = async (sentences, config) => {
  const { targetKss, targetSdWordsKss, maxDiffKss, maxDiffSdWordsKss } = config;
  log.info(
    `Creating saved key strokes distributions for targetKss ${targetKss} (targetSdWordsKss: ${targetSdWordsKss}, maxDiffKss: ${maxDiffKss}, maxDiffSdWordsKss: ${maxDiffSdWordsKss})`
  );
  const rows = [];

  let totalUsableSentences = 0;

  for (let sIdx = 0; sIdx < sentences.length; sIdx += 1) {
    const accuracyDistribution = getWordAccuracies(sentences[sIdx], config);
    const usable =
      accuracyDistribution.diffTotalKss <= maxDiffKss &&
      accuracyDistribution.diffSdWordsKss <= maxDiffSdWordsKss;
    if (usable || addUnusableSentences) {
      totalUsableSentences += 1;
      rows.push({ ...accuracyDistribution, usable });
    }
  }

  const jsonFile = JSON.stringify({ ...config, rows });
  const targetFile = path.join(outputDirPath, getTargetFileName(targetKss));
  await fs.writeFile(targetFile, jsonFile, "utf8");
  log.info(
    `${totalUsableSentences} usable sentences written in ${targetFile}!`
  );
};

const main = async () => {
  const file = await fs.readFile(sentencesPath, "utf-8");

  const sentences = file
    .split("\n")
    .map(s => s.trim())
    .filter(s => s !== "");

  log.info(`${sentences.length} sentences found in ${sentencesPath}.`);

  try {
    await fs.mkdir(outputDirPath);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  for (let i = 0; i < configs.length; i += 1) {
    // This is done one after the other because most of the async stuff is
    // fast anyway, but since it deals with a lot of data, I would rather
    // not have many instances of it in memory.
    // eslint-disable-next-line no-await-in-loop
    await generateDistribution(sentences, configs[i]);
  }
};

if (require.main === module) {
  main().catch(err => log.error(err));
}
