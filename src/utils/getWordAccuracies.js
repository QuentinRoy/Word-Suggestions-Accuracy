import { sd, mean, sum } from "./arrays";

const getBranchResult = (wordEntries, targetAccuracy, targetSd, maxSd) => {
  const normalizedSks = wordEntries.map(d => d.sks / d.word.length);
  const meanAccuracy = mean(normalizedSks);
  const weightedAccuracy =
    sum(wordEntries.map(d => d.sks)) / sum(wordEntries.map(d => d.word.length));
  const sdAccuracy = sd(normalizedSks, meanAccuracy);
  const diffAccuracy = Math.abs(targetAccuracy - meanAccuracy);
  const diffSd = Math.abs(sdAccuracy - targetSd);
  const score =
    diffSd > maxSd ? Number.POSITIVE_INFINITY : (diffAccuracy + diffSd) / 2;
  return {
    score,
    words: wordEntries,
    meanAccuracy,
    weightedAccuracy,
    sdAccuracy,
    diffAccuracy,
    diffSd
  };
};

const getWordAccuraciesFromWordList = (
  wordList,
  targetAccuracy,
  targetSd,
  maxSd,
  branchWordEntries
) => {
  if (wordList.length === branchWordEntries.length) {
    return getBranchResult(branchWordEntries, targetAccuracy, targetSd, maxSd);
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

const getWordAccuracies = (sentence, targetAccuracy, targetSd, maxSd) =>
  getWordAccuraciesFromWordList(
    sentence.split(" ").filter(s => s !== ""),
    targetAccuracy,
    targetSd,
    maxSd,
    []
  );

export default getWordAccuracies;
