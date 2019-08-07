import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./SuggestionsBar.module.css";
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

function SuggestionsBar({
  mainSuggestionPosition,
  totalSuggestions,
  focusedSuggestion,
  suggestions,
  onSelectionStart,
  onSelectionEnd
}) {
  const buttonRefs = useMultiRef(totalSuggestions);

  const buttons = createSuggestionDistribution(
    totalSuggestions,
    mainSuggestionPosition
  ).map((suggestionNum, i) => {
    const selStart = e => {
      e.preventDefault();
      onSelectionStart(suggestions[suggestionNum]);
    };
    const selEnd = e => {
      e.preventDefault();
      onSelectionEnd(suggestions[suggestionNum]);
    };
    return (
      <button
        type="button"
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className={classNames({
          [styles.button]: true,
          [styles.focused]: focusedSuggestion === i
        })}
        ref={buttonRefs[i]}
        tabIndex={-1}
        onTouchStart={selStart}
        onTouchEnd={selEnd}
        onTouchCancel={selEnd}
      >
        {suggestions[suggestionNum]}
      </button>
    );
  });

  return <div className={styles.main}>{buttons}</div>;
}

SuggestionsBar.propTypes = {
  mainSuggestionPosition: PropTypes.number.isRequired,
  totalSuggestions: PropTypes.number.isRequired,
  focusedSuggestion: PropTypes.number,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectionStart: PropTypes.func.isRequired,
  onSelectionEnd: PropTypes.func
};

SuggestionsBar.defaultProps = {
  focusedSuggestion: null,
  onSelectionEnd: () => {}
};

export default SuggestionsBar;
