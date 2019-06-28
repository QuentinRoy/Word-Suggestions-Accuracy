import PropTypes from "prop-types";

//const distance = require("jaro-winkler");

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
function ReadCSV(word, testWords, accuracy) {
  //console.log("================= NEXT WORDS ====================");
  const helpers = ["", "", ""];
  const parsedFile = [...new Set(testWords)]; //delete duplicates

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
  /*
  const topScores = [0, 0, 0];
  const dist = Array(reducedParsedFile.length).fill(null);

  for (let i = 0; i < reducedParsedFile.length; i += 1) {
    dist[i] = distance(word, reducedParsedFile[i]);
    if (reducedParsedFile[i] === "hello") {
      console.log(dist[i]);
    }
    if (dist[i] > 0.8) {
      if (dist[i] > topScores[0]) {
        topScores[0] = dist[i];
        helpers[0] = reducedParsedFile[i];
      } else if (dist[i] > topScores[1]) {
        topScores[1] = dist[i];
        helpers[1] = reducedParsedFile[i];
      } else if (dist[i] > topScores[2]) {
        topScores[2] = dist[i];
        helpers[2] = reducedParsedFile[i];
      }
    }
  }
  console.log("topScores", topScores);
  console.log("helpers", helpers);
*/
  //
  // BASIC WORD COMPLETION
  //

  let charUpper = false;
  if (word !== undefined && word.charAt(0) === word.charAt(0).toUpperCase())
    charUpper = true;

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
  if (charUpper) {
    for (let j = 0; j < helpers.length; j += 1) {
      if (helpers[j] !== undefined)
        helpers[j] = helpers[j].charAt(0).toUpperCase() + helpers[j].slice(1);
    }
  }
  return helpers;
}

ReadCSV.propTypes = {
  word: PropTypes.string.isRequired,
  testWords: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ReadCSV;
