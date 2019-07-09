const distance = require("jaro-winkler");

/*
const levenshteinDistance = (str1, str2) => {
  const distanceMatrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, // deletion
        distanceMatrix[j - 1][i] + 0.3, // insertion
        distanceMatrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return distanceMatrix[str2.length][str1.length];
};
*/

function computeSuggestions(
  word,
  wordList,
  thresholdPosition,
  wordFromText,
  totalSuggestions
) {
  let charUpper = false;
  // console.log("================= NEXT WORDS ====================");

  //
  // LEVENSHEIN DISTANCE
  //
  /*
  let minimumSize = 10;
  const helpers2 = Array(parsedFile.length).fill(null);
  for (let i = 0; i < parsedFile.length; i += 1) {
    helpers2[i] = levenshteinDistance(word, parsedFile[i]);
    if (
      helpers2[i] > 0 &&
      helpers2[i] <= 1 &&
      helpers2[i] !== helpers2[i - 1] &&
      helpers2[i] !== ""
    ) {
      console.log(parsedFile[i]);
    }
    minimumSize = helpers2[i] < minimumSize ? helpers2[i] : minimumSize;
  }
  */

  //
  // JARO-WINKLER DISTANCE
  //

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
    const dist = distance(word.toLowerCase(), wordList[i].word);
    if (wordList[i].word === wordFromText.toLowerCase()) {
      const accuracyDistance = distance(
        word.toLowerCase(),
        wordFromText.slice(0, word.length).toLowerCase()
      );
      if (
        (word.length >= thresholdPosition && accuracyDistance >= 0.65) ||
        thresholdPosition === 0
      ) {
        insertTopWord(wordList[i].word, Number.POSITIVE_INFINITY);
        if (wordFromText.charAt(0) === wordFromText.charAt(0).toUpperCase()) {
          charUpper = true;
        }
      }
    } else {
      insertTopWord(wordList[i].word, dist);
    }
  }

  //
  // BASIC WORD COMPLETION
  //
  if (
    word !== undefined &&
    word !== "" &&
    word.charAt(0) === word.charAt(0).toUpperCase()
  )
    charUpper = true;
  /*
  if (word !== "") {
    let reducedParsedFile = parsedFile.filter(
      w => w.slice(0, word.length) === word.toLowerCase()
    );
    for (let i = 0; i < helpers.length; i += 1) {
      helpers[i] = reducedParsedFile.reduce((shortestWord, currentWord) => {
        return currentWord.length < shortestWord.length
          ? currentWord
          : shortestWord;
      }, reducedParsedFile[0]);
      reducedParsedFile = reducedParsedFile.filter(w => w !== helpers[i]);
    }
  }
  */
  if (charUpper) {
    for (let j = 0; j < topWords.length; j += 1) {
      if (topWords[j] !== undefined)
        topWords[j] =
          topWords[j].charAt(0).toUpperCase() + topWords[j].slice(1);
    }
  }
  return topWords;
}

export default computeSuggestions;
