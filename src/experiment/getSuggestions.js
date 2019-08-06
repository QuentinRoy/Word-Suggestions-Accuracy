import { count } from "../utils/arrays";

const getLettersCompleted = (dictionaryWord, inputWord) => {
  let countLettersCompleted = 0;
  for (let i = 0; i < dictionaryWord.length; i += 1) {
    if (i === inputWord.length) {
      countLettersCompleted += dictionaryWord.length - i;
      break;
    }
    if (dictionaryWord[i] !== inputWord[i]) {
      countLettersCompleted += 1;
    }
  }
  return countLettersCompleted;
};

const frequencyScore = (freq, dictionaryWord, inputWord) => {
  return (
    (freq / 255) *
    (1 - getLettersCompleted(dictionaryWord, inputWord) / dictionaryWord.length)
  );
};

function computeSuggestions(
  currentInputWord,
  targetWordSKS,
  targetWord,
  totalSuggestions,
  dictionary
) {
  let charUpper = false;

  const topWords = Array(totalSuggestions).fill(null);
  const topWordsScore = Array(totalSuggestions).fill(0);

  const insertTopWord = (wordToInsert, score) => {
    const firstSmallestIndex = topWordsScore.findIndex(s => s < score);
    if (firstSmallestIndex >= 0) {
      // Insert the word at the corresponding location.
      topWordsScore.splice(firstSmallestIndex, 0, score);
      topWords.splice(firstSmallestIndex, 0, wordToInsert);
      // Remove the extraneous words.
      topWordsScore.pop();
      topWords.pop();
    }
  };

  const getTotalFrequencyScores = () => {
    let scoresSum = 0;
    for (let i = 0; i < dictionary.length - 1; i += 1) {
      scoresSum += frequencyScore(
        dictionary[i].f,
        dictionary[i].word,
        currentInputWord
      );
    }
    return scoresSum;
  };

  const totalFrequencyScores = getTotalFrequencyScores();

  for (let i = 0; i < dictionary.length - 1; i += 1) {
    const inputWordScore = frequencyScore(
      dictionary[i].f,
      dictionary[i].word,
      currentInputWord
    );
    const normalizedInputWordScore = inputWordScore / totalFrequencyScores;
    if (dictionary[i].word.toLowerCase() === targetWord.toLowerCase()) {
      if (currentInputWord.length >= targetWord.length - targetWordSKS) {
        insertTopWord(dictionary[i].word, Number.POSITIVE_INFINITY);
        if (targetWord.charAt(0) === targetWord.charAt(0).toUpperCase()) {
          charUpper = true;
        }
      }
    } else if (
      dictionary[i].word.length > currentInputWord.length ||
      currentInputWord === ""
    ) {
      insertTopWord(dictionary[i].word, normalizedInputWordScore);
    }
  }

  if (
    currentInputWord !== undefined &&
    currentInputWord !== "" &&
    currentInputWord.charAt(0) === currentInputWord.charAt(0).toUpperCase()
  )
    charUpper = true;

  for (let j = 0; j < topWords.length; j += 1) {
    if (topWords[j] !== null) {
      if (charUpper) {
        topWords[j] =
          topWords[j].charAt(0).toUpperCase() + topWords[j].slice(1);
      } else {
        topWords[j] =
          topWords[j].charAt(0).toLowerCase() + topWords[j].slice(1);
      }
    } else {
      for (let i = 0; i < dictionary.length; i += 1) {
        if (topWords.indexOf(dictionary[i].word) === -1) {
          topWords[j] = dictionary[i].word;
          break;
        }
      }
    }
  }
  return topWords;
}

// Returns a new state with the suggestions filled in based on the input.
const getSuggestions = (
  totalSuggestions,
  dictionary,
  sksDistribution,
  input
) => {
  // This may produce empty words (""). This is OK.
  const inputWords = input.split(" ");
  // Note: if input ends with a space, then the input word is "". This is
  // on purpose.
  const currentInputWord =
    inputWords.length > 0 ? inputWords[inputWords.length - 1] : "";

  // Since inputWords may contain empty words, we only count the non empty
  // one.
  const totalInputWords = count(inputWords, w => w !== "");
  const currentWordIndex =
    currentInputWord === "" ? totalInputWords : totalInputWords - 1;
  const currentWord = sksDistribution[currentWordIndex];

  return computeSuggestions(
    currentInputWord,
    currentWord == null ? 0 : currentWord.sks,
    currentWord == null ? "" : currentWord.word,
    totalSuggestions,
    dictionary
  );
};

export default getSuggestions;
