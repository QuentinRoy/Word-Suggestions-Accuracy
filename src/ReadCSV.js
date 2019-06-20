import PropTypes from "prop-types";
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
function ReadCSV(word, testWords) {
  //console.log("================= NEXT WORDS ====================");
  const helpers = ["", "", ""];

  /*let minimumSize = 10;
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
  let charUpper = false;
  if (word.charAt(0) === word.charAt(0).toUpperCase()) charUpper = true;

  if (word !== "") {
    let reducedParsedFile = testWords.filter(
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
  word: PropTypes.string.isRequired
};

export default ReadCSV;
