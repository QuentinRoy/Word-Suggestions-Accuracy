const sum = require("lodash/sum");
const sumBy = require("lodash/sumBy");
const mean = require("lodash/mean");
const meanBy = require("lodash/meanBy");

const maxSDPenalty = 100;
const maxAccuracyPenalty = 1000;
const weightDiffWordMeanKss = 0;
const weightTotalKss = 4;
const weightDiffSd = 4;

const sd = (lst, lstMean = mean(lst)) => {
  const squareDiffs = lst.map(x => (x - lstMean) ** 2);
  return Math.sqrt(sum(squareDiffs) / lst.length);
};

const randomBool = () => Math.random() < 0.5;

const getSaving = (word, sks) => sks / word.length;

const getBranchTotalKeyStrokeSaving = wordEntries => {
  const totalCharacters = sumBy(wordEntries, e => e.word.length);
  return sumBy(wordEntries, e => e.sks) / totalCharacters;
};

// Smaller is better.
const getBranchResult = (
  wordEntries,
  { targetKss, targetSdWordKss, maxDiffKss, maxDiffSdWordKss }
) => {
  const meanWordsKss = meanBy(wordEntries, e => getSaving(e.word, e.sks));
  const sdWordKss = sd(
    wordEntries.map(e => getSaving(e.word, e.sks)),
    meanWordsKss
  );
  const totalKss = getBranchTotalKeyStrokeSaving(wordEntries);

  const diffTotalKss = Math.abs(targetKss - totalKss);
  const diffWordMeanKss = Math.abs(targetKss - meanWordsKss);
  const diffSdWordKss = Math.abs(targetSdWordKss - sdWordKss);
  let score =
    (diffWordMeanKss * weightDiffWordMeanKss +
      diffSdWordKss * weightDiffSd +
      diffTotalKss * weightTotalKss) /
    (weightTotalKss + weightDiffWordMeanKss + weightDiffSd);
  if (diffTotalKss > maxDiffKss) score *= maxAccuracyPenalty;
  if (diffSdWordKss > maxDiffSdWordKss) score *= maxSDPenalty;

  return {
    totalKss,
    meanWordsKss,
    sdWordKss,
    diffTotalKss,
    diffWordMeanKss,
    diffSdWordKss,
    score
  };
};

const getWordAccuraciesFromWordList = (
  wordList,
  branchWordEntries,
  scoreOpts
) => {
  if (wordList.length === branchWordEntries.length) {
    return {
      ...getBranchResult(branchWordEntries, scoreOpts),
      words: branchWordEntries
    };
  }
  const currentWordIdx = branchWordEntries.length;
  const currentWord = wordList[currentWordIdx];
  let best = null;
  const maxInsertedChars = currentWord.length;
  for (let sks = 0; sks <= maxInsertedChars; sks += 1) {
    // You cannot have a suggestion that would only appear for a final white
    // space in INLINE mode. So you cannot save only 1 key stroke in this case.
    if (!(sks === 1 && currentWord.endsWith(" "))) {
      const thisWordEntry = { word: currentWord, sks };
      const subBranchResult = getWordAccuraciesFromWordList(
        wordList,
        [...branchWordEntries, thisWordEntry],
        scoreOpts
      );
      if (
        best == null ||
        subBranchResult.score < best.score ||
        (subBranchResult.score === best.score && randomBool())
      ) {
        best = subBranchResult;
      }
    }
  }
  return best;
};

const getWordAccuracies = (
  sentence,
  { targetKss, targetSdWordKss, maxDiffKss, maxDiffSdWordKss }
) =>
  getWordAccuraciesFromWordList(
    sentence
      .split(" ")
      .filter(s => s !== "")
      .map(w => `${w} `),
    [],
    {
      targetKss,
      targetSdWordKss,
      maxDiffKss,
      maxDiffSdWordKss
    }
  );

module.exports = getWordAccuracies;
