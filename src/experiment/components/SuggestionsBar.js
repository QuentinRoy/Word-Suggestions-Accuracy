import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./styles/SuggestionsBar.module.scss";
import useMultiRef from "../../utils/useMultiRef";

function SuggestionsBar({
  totalSuggestions,
  focusedSuggestion,
  suggestions,
  onSelectionStart,
  onSelectionEnd
}) {
  const buttonRefs = useMultiRef(totalSuggestions);

  const buttons = Array.from({ length: totalSuggestions }, (_, i) => {
    const suggestion = suggestions[i];
    const selStart = e => {
      e.preventDefault();
      if (suggestion != null) {
        onSelectionStart(suggestion);
      }
    };
    const selEnd = e => {
      e.preventDefault();
      if (suggestion != null) {
        onSelectionEnd(suggestion);
      }
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
        {suggestion != null ? suggestion.trim() : null}
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
