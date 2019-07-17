import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./WordHelper.module.css";
import useComputeSuggestions from "./useComputeSuggestions";
import useMultiRef from "../utils/useMultiRef";

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
  onLog,
  mainSuggestionPosition,
  totalSuggestions,
  focusedSuggestion,
  accuracy,
  thresholdPositions
}) {
  const [help, setHelp] = useState([]);
  const [suggestionUsedOnLog, setSuggestionUsedOnLog] = useState([]);
  const [wordReplacedOnLog, setWordReplacedOnLog] = useState([]);
  const computeSuggestions = useComputeSuggestions();

  useEffect(() => {
    if (countSimilarChars(text, input) !== text.length) {
      const inputLastWord = input.slice(
        input.lastIndexOf(" ") > 0 ? input.lastIndexOf(" ") + 1 : 0
      );
      const arrayText = text.split(" ");
      const wordIndex = [...input].filter(c => c === " ").length;
      const wordFromText =
        wordIndex < arrayText.length
          ? arrayText[wordIndex]
          : arrayText[arrayText.length - 1];
      const wordIndexInText = arrayText.indexOf(wordFromText);
      setHelp(
        computeSuggestions(
          inputLastWord,
          thresholdPositions[wordIndexInText].sks,
          wordFromText,
          totalSuggestions
        )
      );
    }
  }, [
    input,
    accuracy,
    text,
    totalSuggestions,
    thresholdPositions,
    countSimilarChars,
    computeSuggestions
  ]);

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
      <tbody>
        <tr>{buttons}</tr>
      </tbody>
    </table>
  );
}

WordHelper.propTypes = {
  countSimilarChars: PropTypes.func.isRequired,
  input: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  mainSuggestionPosition: PropTypes.number.isRequired,
  totalSuggestions: PropTypes.number.isRequired,
  focusedSuggestion: PropTypes.number,
  accuracy: PropTypes.number.isRequired,
  thresholdPositions: PropTypes.arrayOf(PropTypes.object).isRequired
};

WordHelper.defaultProps = {
  focusedSuggestion: null
};

export default WordHelper;
