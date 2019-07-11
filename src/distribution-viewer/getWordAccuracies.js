import { sd, mean, sum } from "../utils/arrays";

export const getScore = (result, targetAccuracy, targetSd) => {
  const diffAccuracy = Math.abs(targetAccuracy - result.weightedAccuracy);
  const diffSd = Math.abs(result.sdAccuracy - targetSd);
  return (diffAccuracy + diffSd) / 2;
};

export const getBranchResult = (
  wordEntries,
  targetAccuracy,
  targetSd,
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
  return {
    ...result,
    score: innerGetScore(result, targetAccuracy, targetSd)
  };
};

const getWordAccuraciesFromWordList = (
  wordList,
  targetAccuracy,
  targetSd,
  branchWordEntries,
  innerGetBranchResult = getBranchResult
) => {
  if (wordList.length === branchWordEntries.length) {
    return innerGetBranchResult(branchWordEntries, targetAccuracy, targetSd);
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
      [...branchWordEntries, thisWordEntry]
    );
    if (best == null || subBranchResult.score < best.score) {
      best = subBranchResult;
    }
  }
  return best;
};

const getWordAccuracies = (sentence, targetAccuracy, targetSd) =>
  getWordAccuraciesFromWordList(
    sentence.split(" ").filter(s => s !== ""),
    targetAccuracy,
    targetSd,
    []
  );

export default getWordAccuracies;
