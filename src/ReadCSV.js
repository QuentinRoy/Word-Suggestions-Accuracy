import PropTypes from "prop-types";
//import Papa from "papaparse";

function ReadCSV(word, testWords) {
  const helpers = ["", "", ""];
  if (word !== "") {
    //parsing file to only keep words with the same first letters
    let reducedParsedFile = testWords.filter(
      w => w.slice(0, word.length) === word
    );
    //add the 3 shortest words of reducedParsedFile to helpers
    for (let i = 0; i < helpers.length; i += 1) {
      helpers[i] = reducedParsedFile.reduce((shortestWord, currentWord) => {
        return currentWord.length < shortestWord.length
          ? currentWord
          : shortestWord;
      }, reducedParsedFile[0]);
      reducedParsedFile = reducedParsedFile.filter(w => w !== helpers[i]);
    }
  }
  return helpers;
}

ReadCSV.propTypes = {
  word: PropTypes.string.isRequired
};

export default ReadCSV;
