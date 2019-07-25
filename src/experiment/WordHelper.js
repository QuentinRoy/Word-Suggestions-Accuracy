import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./WordHelper.module.css";
import useMultiRef from "../utils/useMultiRef";
import Logging from "./Logging";

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
  onLog,
  mainSuggestionPosition,
  totalSuggestions,
  focusedSuggestion,
  suggestions,
  correctCharsCount,
  eventList
}) {
  const suggestionHandler = word => {
    if (word !== undefined && word !== "") {
      const i = input.lastIndexOf(" ");
      let newInput = `${input.slice(0, i + 1) + word} `;
      if (i === text.lastIndexOf(" ")) {
        newInput = newInput.slice(0, -1);
      }
      setInput(newInput);
      Logging(
        "used_suggestion",
        false,
        "{enter}",
        text,
        input,
        suggestions,
        word,
        correctCharsCount,
        onLog,
        eventList
      );
    }
  };

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
        onClick={() => suggestionHandler(suggestions[suggestionNum])}
      >
        {suggestions[suggestionNum]}
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
  input: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  mainSuggestionPosition: PropTypes.number.isRequired,
  totalSuggestions: PropTypes.number.isRequired,
  focusedSuggestion: PropTypes.number,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  correctCharsCount: PropTypes.number.isRequired,
  eventList: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.objectOf(
        PropTypes.oneOfType([
          PropTypes.bool,
          PropTypes.string,
          PropTypes.number
        ])
      )
    )
  ).isRequired
};

WordHelper.defaultProps = {
  focusedSuggestion: null
};

export default WordHelper;
