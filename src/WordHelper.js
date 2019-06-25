import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./WordHelper.css";
import ReadCSV from "./ReadCSV";

function WordHelper({
  input,
  text,
  setInput,
  countSimilarChars,
  dictionary,
  onLog
}) {
  const [help, setHelp] = useState(["", "", ""]);
  const [suggestionUsedOnLog, setSuggestionUsedOnLog] = useState([]);
  const [wordReplacedOnLog, setWordReplacedOnLog] = useState([]);

  useEffect(() => {
    const word = input.slice(
      input.lastIndexOf(" ") > 0 ? input.lastIndexOf(" ") + 1 : 0
    );
    setHelp(ReadCSV(word, dictionary));
  }, [dictionary, input]);

  useEffect(() => {
    onLog("suggested words used", suggestionUsedOnLog);
    onLog("input when suggestion used", wordReplacedOnLog);
  }, [onLog, suggestionUsedOnLog, wordReplacedOnLog]);

  function helpHandler(word) {
    if (word !== undefined && word !== "") {
      const i = input.lastIndexOf(" ");
      const newInput = `${input.slice(0, i + 1) + word} `;
      setWordReplacedOnLog(wordReplacedOnLog.concat(input.slice(i + 1)));
      setInput(newInput);
      countSimilarChars(text, input);
      setSuggestionUsedOnLog(suggestionUsedOnLog.concat(word));
    }
  }

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <button type="button" onClick={() => helpHandler(help[1])}>
              {help[1]}
            </button>
          </td>
          <td>
            <button type="button" onClick={() => helpHandler(help[0])}>
              {help[0]}
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
  dictionary: PropTypes.arrayOf(PropTypes.string).isRequired,
  onLog: PropTypes.func.isRequired
};

export default WordHelper;
