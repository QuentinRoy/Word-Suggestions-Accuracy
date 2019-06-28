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
  testWords,
  thresholdCharPos,
  wordFromText,
  totalSuggestions
) {
  // console.log("================= NEXT WORDS ====================");

  //
  // LEVENSHEIN DISTANCE
  //
  /*
  let minimumSize = 10;
  const helpers2 = Array(testWords.length).fill(null);
  for (let i = 0; i < testWords.length; i += 1) {
    helpers2[i] = levenshteinDistance(word, testWords[i]);
    if (
      helpers2[i] > 0 &&
      helpers2[i] <= 1 &&
      helpers2[i] !== helpers2[i - 1] &&
      helpers2[i] !== ""
    ) {
      console.log(testWords[i]);
    }
    minimumSize = helpers2[i] < minimumSize ? helpers2[i] : minimumSize;
  }
  */

  //
  // JARO-WINKLER DISTANCE
  //

  const helpers = Array(totalSuggestions).fill(null);
  const wordList = [...new Set(testWords)]; // delete duplicates
  const topScores = Array(totalSuggestions).fill(0);

  const insertScore = (wordToInsert, score) => {
    const firstSmallestIndex = topScores.findIndex(s => s < score);
    if (firstSmallestIndex >= 0) {
      // Insert the word at the corresponding location.
      topScores.splice(firstSmallestIndex, 0, score);
      helpers.splice(firstSmallestIndex, 0, wordToInsert);
      // Remove the extraneous word.
      topScores.pop();
      helpers.pop();
    }
  };

  for (let i = 0; i < wordList.length; i += 1) {
    const dist = distance(word.toLowerCase(), wordList[i]);
    if (wordList[i] === wordFromText.toLowerCase()) {
      const accuracyDistance = distance(
        word.toLowerCase(),
        wordFromText.slice(0, word.length)
      );
      if (
        (word.length >= thresholdCharPos && accuracyDistance >= 0.65) ||
        thresholdCharPos === 0
      ) {
        insertScore(wordList[i], Number.POSITIVE_INFINITY);
      }
    } else {
      insertScore(wordList[i], dist);
    }
  }

  //
  // BASIC WORD COMPLETION
  //

  let charUpper = false;
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
    for (let j = 0; j < helpers.length; j += 1) {
      if (helpers[j] !== undefined)
        helpers[j] = helpers[j].charAt(0).toUpperCase() + helpers[j].slice(1);
    }
  }
  return helpers;
}

export default computeSuggestions;
