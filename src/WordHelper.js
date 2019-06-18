import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./WordHelper.css";
import ReadCSV from "./ReadCSV";

function WordHelper({ input, text, setInput, countSimilarChars, dictionary }) {
  const [help, setHelp] = useState(["", "", ""]);

  useEffect(() => {
    setHelp(
      ReadCSV(
        input.slice(
          input.lastIndexOf(" ") > 0 ? input.lastIndexOf(" ") + 1 : 0
        ),
        dictionary
      )
    );
  }, [dictionary, input]);

  function helpHandler(word) {
    if (word !== undefined) {
      const i = input.lastIndexOf(" ");
      const newInput = input.slice(0, i + 1) + word;
      setInput(newInput);
      countSimilarChars(text, input);
    }
  }

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <button type="button" onClick={() => helpHandler(help[0])}>
              {help[0]}
            </button>
          </td>
          <td>
            <button type="button" onClick={() => helpHandler(help[1])}>
              {help[1]}
            </button>
          </td>
          <td>
            <button type="button" onClick={() => helpHandler(help[2])}>
              {help[2]}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

WordHelper.propTypes = {
  countSimilarChars: PropTypes.func.isRequired,
  input: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  dictionary: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default WordHelper;
