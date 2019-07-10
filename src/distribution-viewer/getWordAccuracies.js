import { sd, mean } from "../utils/arrays";

const getBranchResult = (wordEntries, targetAccuracy, targetSd) => {
  const normalizedSks = wordEntries.map(d => d.sks / d.word.length);
  const meanAccuracy = mean(normalizedSks);
  const sdAccuracy = sd(normalizedSks, meanAccuracy);
  const diffAccuracy = Math.abs(targetAccuracy - meanAccuracy);
  const diffSd = Math.abs(sdAccuracy - targetSd);
  const score = (diffAccuracy + diffSd) / 2;
  return {
    score,
    words: wordEntries,
    meanAccuracy,
    sdAccuracy,
    diffAccuracy,
    diffSd
  };
};

const getWordAccuraciesFromWordList = (
  wordList,
  targetAccuracy,
  targetSd,
  branchWordEntries
) => {
  if (wordList.length === branchWordEntries.length) {
    return getBranchResult(branchWordEntries, targetAccuracy, targetSd);
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
