import { sd, mean } from "../utils/arrays";

const branchScore = (wordEntries, targetAccuracy) => {
  const normalizedSks = wordEntries.map(d => d.sks / d.word.length);
  const meanAccuracy = mean(normalizedSks);
  const sdAccuracy = sd(normalizedSks, meanAccuracy);
  const diffAccuracy = Math.abs(targetAccuracy - meanAccuracy);
  return (diffAccuracy + sdAccuracy) / 2;
};

const getWordAccuraciesFromWordList = (
  wordList,
  targetAccuracy,
  branchWordEntries
) => {
  if (wordList.length === branchWordEntries.length) {
    return {
      score: branchScore(branchWordEntries, targetAccuracy),
      words: branchWordEntries,
      meanAccuracy: mean(branchWordEntries.map(d => d.sks / d.word.length))
    };
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
      [...branchWordEntries, thisWordEntry]
    );
    if (best == null || subBranchResult.score < best.score) {
      best = subBranchResult;
    }
  }
  return best;
};

const getWordAccuracies = (sentence, targetAccuracy) =>
  getWordAccuraciesFromWordList(
    sentence.split(" ").filter(s => s !== ""),
    targetAccuracy,
    []
  );

export default getWordAccuracies;
