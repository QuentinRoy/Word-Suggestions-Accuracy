import Papa from "papaparse";
import PropTypes from "prop-types";

function ReadCSV(word) {
  const file = `../Word_lists_csv/${word.charAt(0).toUpperCase()}word.csv`;
  Papa.parse(file, {
    complete(results) {
      //console.log("Finished:", results.data);
    }
  });
}

ReadCSV.propTypes = {
  word: PropTypes.string.isRequired
};

export default ReadCSV;
