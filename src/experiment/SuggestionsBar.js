import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./SuggestionsBar.module.css";
import useMultiRef from "../utils/useMultiRef";

function SuggestionsBar({
  totalSuggestions,
  focusedSuggestion,
  suggestions,
  onSelectionStart,
  onSelectionEnd
}) {
  const buttonRefs = useMultiRef(totalSuggestions);

  const buttons = suggestions.map((suggestion, i) => {
    const selStart = e => {
      e.preventDefault();
      onSelectionStart(suggestion);
    };
    const selEnd = e => {
      e.preventDefault();
      onSelectionEnd(suggestion);
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
        {suggestion}
      </button>
    );
  });

  return <div className={styles.main}>{buttons}</div>;
}

SuggestionsBar.propTypes = {
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
