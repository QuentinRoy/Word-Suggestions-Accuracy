import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./WordHelper.module.css";
import computeSuggestions from "./computeSuggestions";
import useMultiRef from "./useMultiRef";

function accuracyDistribution(wordFromText, accuracy) {
  return wordFromText.length - (wordFromText.length * accuracy) / 100;
}

/**
 * Create a distribution of suggestions indicating where the most relevant
 * suggestions should be positioned.
 *
 * @param {number} totalSuggestions The total number of suggestions
 * @param {number} mainPosition The position of the most relevant suggestion
 * @returns {Array<Number>} An array containing the index of the most relevant
 * positions (0 is the most relevant) and where they should be positioned.
 *
 * @example
 * createSuggestionDistribution(5, 0)  // returns [0, 1, 2, 3, 4]
 * createSuggestionDistribution(5, 4)  // returns [4, 3, 2, 1, 0]
 * createSuggestionDistribution(3, 1)  // returns [2, 0, 1]
 */
const createSuggestionDistribution = (totalSuggestions, mainPosition) => {
  const dist = [];
  for (let i = 0; i < totalSuggestions; i += 1) {
    const pos = i % 2 === 0 ? mainPosition - i / 2 : mainPosition + (i + 1) / 2;
    if (pos >= totalSuggestions) {
      dist.unshift(i);
    } else if (pos < 0) {
      dist.push(i);
    } else if (pos < mainPosition) {
      dist.unshift(i);
    } else {
      dist.push(i);
    }
  }
  return dist;
};

function WordHelper({
  input,
  text,
  setInput,
  countSimilarChars,
  dictionary,
  onLog,
  mainSuggestionPosition,
  totalSuggestions,
  focusedSuggestion,
  accuracy
}) {
  const [help, setHelp] = useState([]);
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
        : 100;
    setHelp(
      computeSuggestions(
        word,
        dictionary,
        thresholdCharPos,
        wordFromText,
        totalSuggestions
      )
    );
  }, [input, dictionary, accuracy, text, totalSuggestions]);

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

  const buttonRefs = useMultiRef(totalSuggestions);

  const buttons = createSuggestionDistribution(
    totalSuggestions,
    mainSuggestionPosition
  ).map((suggestionNum, i) => (
    <td key={suggestionNum} className={styles.cell}>
      <button
        className={styles.btn}
        ref={buttonRefs[i]}
        type="button"
        onClick={() => helpHandler(help[suggestionNum])}
      >
        {help[suggestionNum]}
      </button>
    </td>
  ));

  useEffect(() => {
    if (focusedSuggestion != null) {
      const buttonRef = buttonRefs[focusedSuggestion];
      buttonRef.current.focus();
    }
  }, [focusedSuggestion, buttonRefs]);

  return (
    <table className={styles.table}>
      <tbody>{buttons}</tbody>
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
  mainSuggestionPosition: PropTypes.number.isRequired,
  totalSuggestions: PropTypes.number.isRequired,
  focusedSuggestion: PropTypes.number,
  accuracy: PropTypes.number.isRequired
};

WordHelper.defaultProps = {
  focusedSuggestion: null
};

export default WordHelper;
