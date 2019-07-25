const sum = list => list.reduce((r, x) => r + x);

const mean = list => sum(list) / list.length;

const sd = (lst, lstMean = mean(lst)) => {
  const squareDiffs = lst.map(x => (x - lstMean) ** 2);
  return Math.sqrt(sum(squareDiffs) / lst.length);
};

const getScore = (result, targetAccuracy, targetSd, maxSd) => {
  const diffAccuracy = Math.abs(targetAccuracy - result.weightedAccuracy);
  const diffSd = Math.abs(result.sdAccuracy - targetSd);
  return {
    score:
      diffSd > maxSd ? Number.POSITIVE_INFINITY : (diffAccuracy + diffSd) / 2,
    diffAccuracy,
    diffSd
  };
};

const getBranchResult = (
  wordEntries,
  targetAccuracy,
  targetSd,
  maxSd,
  innerGetScore = getScore
) => {
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
  const scores = innerGetScore(result, targetAccuracy, targetSd, maxSd);
  return {
    ...result,
    score: scores.score,
    diffAccuracy: scores.diffAccuracy,
    diffSd: scores.diffSd
  };
};

const getWordAccuraciesFromWordList = (
  wordList,
  targetAccuracy,
  targetSd,
  maxSd,
  branchWordEntries,
  innerGetBranchResult = getBranchResult
) => {
  if (wordList.length === branchWordEntries.length) {
    return innerGetBranchResult(
      branchWordEntries,
      targetAccuracy,
      targetSd,
      maxSd
    );
  }
  const currentWord = wordList[branchWordEntries.length];
  let best = null;
  for (let i = 0; i <= currentWord.length; i += 1) {
    const thisWordEntry = {
      word: currentWord,
      sks: i
    };
    const subBranchResult = getWordAccuraciesFromWordList(
      wordList,
      targetAccuracy,
      targetSd,
      maxSd,
      [...branchWordEntries, thisWordEntry]
    );
    if (best == null || subBranchResult.score < best.score) {
      best = subBranchResult;
    }
  }
  return best;
};

exports.getWordAccuracies = (sentence, targetAccuracy, targetSd, maxSd) => {
  return getWordAccuraciesFromWordList(
    sentence.split(" ").filter(s => s !== ""),
    targetAccuracy,
    targetSd,
    maxSd,
    []
  );
};
