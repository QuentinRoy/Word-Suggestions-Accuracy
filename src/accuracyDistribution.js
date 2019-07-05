const extractWord = str => {
  return [str.slice(0, str.indexOf(" ")), str.slice(str.indexOf(" ") + 1)];
};

const dma = (sks, text, a) => {
  const sumSks = sks.reduce((y, z) => y + z, 0);
  return Math.abs(sumSks / text.trim().length - a);
};

// standard deviation
const sda = (m, text, wordList, sks) => {
  let sum = 0;
  for (let i = 0; i < wordList.length; i += 1) {
    sum += Math.pow(sks[i] - m, 2);
  }
  return Math.sqrt((1 / text.trim().length) * sum);
};

// DMa = abs(mean(SKS/letters)-a)
// SDa = sd(SKS/letters)
//
// score = (DMa + SDa) / 2
// meilleur score = 0

const sks = []; //skipped key stroke
const wordList = [];
let topScore = 1;

const accuracyDistribution = (textToType, text, trialAccuracy) => {
  const [word, newTextToType] = extractWord(textToType);
  if (word !== "") {
    wordList.push(word);
    for (let i = 0; i < word.length; i += 1) {
      sks.push(word.length - i); // on ajoute les sks du noeud
      accuracyDistribution(newTextToType, text, trialAccuracy); // on descend dans l'arbre
      sks.pop(); // ici on a termine une feuille donc on remonte et on enleve les sks de la feuille
    }
  }
  // ici on a termine une feuille, on calcule donc le score
  const m = dma(sks, text, trialAccuracy);
  const score = (m + sda(m)) / 2;
  if (score < topScore) {
    topScore = score;
  }
};
