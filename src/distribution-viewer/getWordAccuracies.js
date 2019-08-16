const maxSDPenalty = 10;
const maxAccuracyPenalty = 10;
const weightDiffWeightedAccuracy = 3;
const weightDiffAccuracy = 1;
const weightDiffSd = 4;

const sum = list => list.reduce((r, x) => r + x);

const mean = list => sum(list) / list.length;

const sd = (lst, lstMean = mean(lst)) => {
  const squareDiffs = lst.map(x => (x - lstMean) ** 2);
  return Math.sqrt(sum(squareDiffs) / lst.length);
};

const getScore = (
  result,
  { targetAccuracy, targetSd, maxDiffAccuracy, maxDiffSd }
) => {
  const diffWeightedAccuracy = Math.abs(targetAccuracy - result.sdAccuracy);
  const diffAccuracy = Math.abs(targetAccuracy - result.weightedAccuracy);
  const diffSd = Math.abs(result.sdAccuracy - targetSd);
  let score =
    (diffAccuracy * weightDiffAccuracy +
      diffSd * weightDiffSd +
      diffWeightedAccuracy * weightDiffWeightedAccuracy) /
    (weightDiffAccuracy + weightDiffWeightedAccuracy + weightDiffSd);
  if (diffAccuracy >= maxDiffAccuracy) score *= maxAccuracyPenalty;
  else if (maxDiffSd >= maxSDPenalty) score *= maxSDPenalty;
  return { score, diffAccuracy, diffSd };
};

const getBranchResult = (wordEntries, scoreOpts) => {
  const normalizedSks = wordEntries.map(d => d.sks / d.word.length);
  const meanAccuracy = mean(normalizedSks);
  const weightedAccuracy =
    sum(wordEntries.map(d => d.sks)) / sum(wordEntries.map(d => d.word.length));
  const sdAccuracy = sd(normalizedSks, meanAccuracy);
  const result = {
    words: wordEntries,
    meanAccuracy,
    weightedAccuracy,
    sdAccuracy
  };
  const scoreResult = getScore(result, scoreOpts);
  return { ...scoreResult, ...result };
};

const getWordAccuraciesFromWordList = (
  wordList,
  branchWordEntries,
  scoreOpts
) => {
  if (wordList.length === branchWordEntries.length) {
    return getBranchResult(branchWordEntries, scoreOpts);
  }
  const currentWord = wordList[branchWordEntries.length];
  let best = null;
  for (let i = 0; i <= currentWord.length; i += 1) {
    const thisWordEntry = {
      word: currentWord,
      sks: i,
      normalizedSks: i / currentWord.length
    };
    const subBranchResult = getWordAccuraciesFromWordList(
      wordList,
      [...branchWordEntries, thisWordEntry],
      scoreOpts
    );
    if (best == null || subBranchResult.score < best.score) {
      best = subBranchResult;
    }
  }
  return best;
};

export default (
  sentence,
  { targetAccuracy, targetSd, maxDiffAccuracy, maxDiffSd }
) => {
  return getWordAccuraciesFromWordList(
    sentence.split(" ").filter(s => s !== ""),
    [],
    { targetAccuracy, targetSd, maxDiffAccuracy, maxDiffSd }
  );
};
