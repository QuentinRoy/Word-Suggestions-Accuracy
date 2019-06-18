import PropTypes from "prop-types";
//import Papa from "papaparse";

function ReadCSV(word, testWords) {
  const fileFromWord = "file:///Users/sebastien/accuracy_autocorrect/Word_lists_csv/".concat(
    word.charAt(0).toUpperCase(),
    "word.csv"
  );

  const getHelpers = parsedFile => {
    const helpers = ["", "", ""];
    if (word !== "") {
      //parsing file to only keep words with the same first letters
      let reducedParsedFile = parsedFile.filter(
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
        if (helpers[i] === undefined) helpers[i] = helpers[i - 1];
      }
    }
    return helpers;
  };

  // return Papa.parse(fileFromWord, {
  //   complete(results) {
  //     console.log(results.data);
  //     getWord(results.data);
  //   }
  // });

  /* SOLUTION 2
  const openFile = file => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      console.log(text);
    };
    reader.readAsText(file);
  };*/

  return getHelpers(testWords);
}

ReadCSV.propTypes = {
  word: PropTypes.string.isRequired
};

export default ReadCSV;
