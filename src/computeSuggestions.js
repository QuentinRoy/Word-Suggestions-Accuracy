function computeSuggestions(
  inputWord,
  wordList,
  thresholdPosition,
  wordFromText,
  totalSuggestions
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

  for (let i = 0; i < wordList.length; i += 1) {
    const frequencyScore = Math.abs(
      (wordList[i].f / 255) *
        (1 -
          wordList[i].word.length /
            (wordList[i].word.length - inputWord.length))
    );

    if (wordList[i].word.toLowerCase() === wordFromText.toLowerCase()) {
      if (inputWord.length >= thresholdPosition || thresholdPosition === 0) {
        insertTopWord(wordList[i].word, Number.POSITIVE_INFINITY);
        if (wordFromText.charAt(0) === wordFromText.charAt(0).toUpperCase()) {
          charUpper = true;
        }
      }
    } else if (wordList[i].word.length > inputWord.length || inputWord === "") {
      insertTopWord(wordList[i].word, frequencyScore);
    }
  }

  if (
    inputWord !== undefined &&
    inputWord !== "" &&
    inputWord.charAt(0) === inputWord.charAt(0).toUpperCase()
  )
    charUpper = true;

  if (charUpper) {
    for (let j = 0; j < topWords.length; j += 1) {
      if (topWords[j] !== null)
        topWords[j] =
          topWords[j].charAt(0).toUpperCase() + topWords[j].slice(1);
    }
  }
  return topWords;
}

export default computeSuggestions;
