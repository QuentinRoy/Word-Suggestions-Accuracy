const extractWord = str => {
  const word = str.split(" ").shift();
  const newStr = str.slice(word.length + 1);
  if (word !== "") {
    return [word, newStr];
  }
  return [null, null];
};

// mean
const dma = (skippedKeyStroke, text, acc) => {
  const sumSkippedKeyStroke = skippedKeyStroke.reduce((y, z) => y + z, 0);
  return Math.abs(sumSkippedKeyStroke / text.trim().length - acc);
};

// standard deviation
const sda = (mean, text, wordList, skippedKeyStroke) => {
  let sum = 0;
  for (let i = 0; i < wordList.length; i += 1) {
    sum += Math.pow(skippedKeyStroke[i] / wordList[i].length - mean, 2);
  }
  return Math.sqrt((1 / text.trim().length) * sum);
};

let skippedKeyStroke = [];
let wordList = [];
let topScore = 1;
let bestThresholdPositions = [];

const getBestThresholdPositions = (
  textToType,
  text,
  trialTheoricalAccuracy
) => {
  const [word, newTextToType] = extractWord(textToType);
  if (word !== null) {
    wordList.push(word);
    for (let i = 0; i < word.length; i += 1) {
      skippedKeyStroke.push(word.length - i); // on ajoute les sks de la branche
      getBestThresholdPositions(newTextToType, text, trialTheoricalAccuracy); // on descend dans l'arbre
      skippedKeyStroke.pop(); // ici on a termine une branche donc on remonte et on enleve les sks de la feuille
    }
    wordList.pop();
  } else {
    // ici on a termine une feuille, on calcule donc le score
    const m = dma(skippedKeyStroke, text, trialTheoricalAccuracy);
    const sd = sda(m, text, wordList, skippedKeyStroke);
    const score = (m + sd) / 2;

    if (score < topScore) {
      bestThresholdPositions = [];
      topScore = score;
      for (let j = 0; j < skippedKeyStroke.length; j += 1) {
        bestThresholdPositions.push(wordList[j].length - skippedKeyStroke[j]);
      }
    }
  }
  return bestThresholdPositions;
};

const accuracyDistribution = (textToType, text, trialAccuracy) => {
  skippedKeyStroke = [];
  wordList = [];
  topScore = 1;
  bestThresholdPositions = [];
  return getBestThresholdPositions(textToType, text, trialAccuracy);
};

export default accuracyDistribution;
