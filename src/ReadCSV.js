import PropTypes from "prop-types";
import Papa from "papaparse";

function ReadCSV(word) {
  const fileFromWord = "../Word_lists_csv/".concat(
    word.charAt(0).toUpperCase(),
    "word.csv"
  );

  const getWord = parsedFile => {
    const anotherFile = parsedFile.filter(
      v => v.length >= word.length && v.slice(0, word.length) === word
    );
    let helpers = ["", "", ""];
    for (let i = 0; i < anotherFile.length; i += 1) {
      //changer .map => trouver autre chose
      //reduce puis filter ?
      helpers = helpers.map(v => {
        if (v.length > anotherFile[i].length || v === "") {
          return anotherFile[i];
        }
        return v;
      });
    }
    console.log(helpers);
    return helpers;
  };

  Papa.parse(fileFromWord, {
    complete(results) {
      const testWords = [
        "h",
        "helicopter",
        "hello",
        "head",
        "health",
        "genius"
      ];
      getWord(testWords);
      //console.log("Finished:", results.data);
    }
  });
}

ReadCSV.propTypes = {
  word: PropTypes.string.isRequired
};

export default ReadCSV;
