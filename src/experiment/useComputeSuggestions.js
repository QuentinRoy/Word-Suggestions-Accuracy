import { useCallback } from "react";
import { useDictionary } from "./useDictionary";

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
  inputWord,
  thresholdPosition,
  wordFromText,
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
        inputWord
      );
    }
    return scoresSum;
  };

  const totalFrequencyScores = getTotalFrequencyScores();

  for (let i = 0; i < dictionary.length - 1; i += 1) {
    const inputWordScore = frequencyScore(
      dictionary[i].f,
      dictionary[i].word,
      inputWord
    );
    const normalizedInputWordScore = inputWordScore / totalFrequencyScores;
    if (dictionary[i].word.toLowerCase() === wordFromText.toLowerCase()) {
      if (inputWord.length >= thresholdPosition || thresholdPosition === 0) {
        insertTopWord(dictionary[i].word, Number.POSITIVE_INFINITY);
        if (wordFromText.charAt(0) === wordFromText.charAt(0).toUpperCase()) {
          charUpper = true;
        }
      }
    } else if (
      dictionary[i].word.length > inputWord.length ||
      inputWord === ""
    ) {
      insertTopWord(dictionary[i].word, normalizedInputWordScore);
    }
  }

  if (
    inputWord !== undefined &&
    inputWord !== "" &&
    inputWord.charAt(0) === inputWord.charAt(0).toUpperCase()
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
    }
  }
  return topWords;
}

function useComputeSuggestions(
  inputWord,
  thresholdPosition,
  wordFromText,
  totalSuggestions
) {
  const dictionary = useDictionary();
  const boundComputeSuggestions = useCallback(
    (...args) => computeSuggestions(...args, dictionary),
    [dictionary]
  );
  return boundComputeSuggestions;
}

export default useComputeSuggestions;
