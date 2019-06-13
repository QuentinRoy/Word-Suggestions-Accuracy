import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./WordHelper.css";

function WordHelper({ input, text, setInput, countSimilarChars }) {
  const [wordHelp, setWordHelp] = useState([" ", " ", " "]);

  useEffect(() => {
    setWordHelp(["hello", "is", "text"]);
  }, []);

  function wordHelpHandler(word) {
    const i = input.lastIndexOf(" ");
    const newInput = input.slice(0, i + 1) + word;
    setInput(newInput);
    countSimilarChars(text, input);
  }

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <button type="button" onClick={() => wordHelpHandler(wordHelp[0])}>
              {wordHelp[0]}
            </button>
          </td>
          <td>
            <button type="button" onClick={() => wordHelpHandler(wordHelp[1])}>
              {wordHelp[1]}
            </button>
          </td>
          <td>
            <button type="button" onClick={() => wordHelpHandler(wordHelp[2])}>
              {wordHelp[2]}
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
  setInput: PropTypes.func.isRequired
};

export default WordHelper;
