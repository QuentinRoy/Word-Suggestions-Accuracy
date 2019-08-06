import { count } from "../utils/arrays";
import { isUpperCase } from "../utils/strings";

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
  const isFirstCharUpper =
    currentInputWord !== undefined &&
    currentInputWord !== "" &&
    isUpperCase(targetWord.charAt(0));

  // Pre-fill the top words with the most frequent in the dictionary.
  const topWords = dictionary.slice(0, totalSuggestions).map(e => e.word);
  const topWordsScore = Array(totalSuggestions).fill(0);

  const insertTopWord = (wordToInsert, score) => {
    const capitalizedWordToInsert = isFirstCharUpper
      ? wordToInsert.charAt(0).toUpperCase() + wordToInsert.slice(1)
      : wordToInsert;
    const firstSmallestIndex = topWordsScore.findIndex(s => s < score);
    if (firstSmallestIndex >= 0) {
      // Insert the word at the corresponding location.
      topWordsScore.splice(firstSmallestIndex, 0, score);
      topWords.splice(firstSmallestIndex, 0, capitalizedWordToInsert);
      // Remove the extraneous words.
      topWordsScore.pop();
      topWords.pop();
    }
  };

  if (currentInputWord.length >= targetWord.length - targetWordSKS) {
    insertTopWord(targetWord, Number.POSITIVE_INFINITY);
  }

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

  dictionary.forEach(({ word, f: frequency }) => {
    if (
      word.toLowerCase() !== targetWord.toLowerCase() &&
      (word.length > currentInputWord.length || currentInputWord === "")
    ) {
      const inputWordScore = frequencyScore(frequency, word, currentInputWord);
      const normalizedInputWordScore = inputWordScore / totalFrequencyScores;
      insertTopWord(word, normalizedInputWordScore);
    }
  });

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
