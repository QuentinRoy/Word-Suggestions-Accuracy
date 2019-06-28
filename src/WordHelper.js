import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./WordHelper.css";
import ReadCSV from "./ReadCSV";

function accuracyDistribution(wordFromText, accuracy) {
  return wordFromText.length - (wordFromText.length * accuracy) / 100;
}

function WordHelper({
  input,
  text,
  setInput,
  countSimilarChars,
  dictionary,
  onLog,
  keyboardID,
  accuracy,
  buttonRef1,
  buttonRef2,
  buttonRef3
}) {
  const [help, setHelp] = useState(["", "", ""]);
  const [suggestionUsedOnLog, setSuggestionUsedOnLog] = useState([]);
  const [wordReplacedOnLog, setWordReplacedOnLog] = useState([]);

  useEffect(() => {
    const word = input.slice(
      input.lastIndexOf(" ") > 0 ? input.lastIndexOf(" ") + 1 : 0
    );
    let wordFromText = text.slice(input.lastIndexOf(" ") + 1);
    if (wordFromText.indexOf(" ") > 0) {
      wordFromText = wordFromText.slice(0, wordFromText.indexOf(" "));
    }
    const thresholdCharPos =
      wordFromText.length > 3
        ? accuracyDistribution(wordFromText, accuracy)
        : 30;
    setHelp(ReadCSV(word, dictionary, thresholdCharPos, wordFromText));
  }, [input, dictionary, accuracy, text]);

  useEffect(() => {
    onLog("suggested words used", suggestionUsedOnLog);
    onLog("input when suggestion used", wordReplacedOnLog);
  }, [onLog, suggestionUsedOnLog, wordReplacedOnLog]);

  function helpHandler(word) {
    if (word !== undefined && word !== "") {
      const i = input.lastIndexOf(" ");
      const newInput = `${input.slice(0, i + 1) + word} `;
      setWordReplacedOnLog(wordReplacedOnLog.concat(input.slice(i + 1, -1)));
      setInput(newInput);
      countSimilarChars(text, input);
      setSuggestionUsedOnLog(suggestionUsedOnLog.concat(word));
    }
  }

  const kbWordIdx = keyboardID === "physical" ? 0 : 1;

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <button
              ref={buttonRef1}
              type="button"
              onClick={() => helpHandler(help[kbWordIdx])}
            >
              {help[kbWordIdx]}
            </button>
          </td>
          <td>
            <button
              ref={buttonRef2}
              type="button"
              onClick={() => helpHandler(help[(kbWordIdx + 1) % 2])}
            >
              {help[(kbWordIdx + 1) % 2]}
            </button>
          </td>
          <td>
            <button
              ref={buttonRef3}
              type="button"
              onClick={() => helpHandler(help[2])}
            >
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
  onLog: PropTypes.func.isRequired,
  keyboardID: PropTypes.string.isRequired,
  accuracy: PropTypes.number.isRequired,
  buttonRef1: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]).isRequired,
  buttonRef2: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]).isRequired,
  buttonRef3: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]).isRequired
};

export default WordHelper;
