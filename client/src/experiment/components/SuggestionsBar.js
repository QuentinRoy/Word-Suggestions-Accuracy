import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./styles/SuggestionsBar.module.scss";
import usePreventTouchDefault from "../hooks/usePreventTouchDefault";

const Suggestionbutton = ({
  suggestion,
  onSelectionStart,
  onSelectionEnd,
  isFocused
}) => {
  const selStart = evt => {
    evt.preventDefault();
    if (suggestion != null) {
      onSelectionStart(suggestion);
    }
  };
  const selEnd = evt => {
    evt.preventDefault();
    if (suggestion != null) {
      onSelectionEnd(suggestion);
    }
  };
  return (
    <button
      type="button"
      className={classNames({
        [styles.button]: true,
        [styles.focused]: isFocused
      })}
      tabIndex={-1}
      onTouchStart={selStart}
      onTouchEnd={selEnd}
      onTouchCancel={selEnd}
    >
      {suggestion != null ? suggestion.trim() : null}
    </button>
  );
};
Suggestionbutton.propTypes = {
  suggestion: PropTypes.string,
  onSelectionStart: PropTypes.func.isRequired,
  onSelectionEnd: PropTypes.func.isRequired,
  isFocused: PropTypes.bool.isRequired
};
Suggestionbutton.defaultProps = { suggestion: undefined };

const preventedEvents = ["touchmove"];

function SuggestionsBar({
  totalSuggestions,
  focusedSuggestion,
  suggestions,
  onSelectionStart,
  onSelectionEnd
}) {
  const buttons = Array.from({ length: totalSuggestions }, (_, i) => (
    <Suggestionbutton
      key={i}
      suggestion={suggestions[i]}
      onSelectionStart={onSelectionStart}
      onSelectionEnd={onSelectionEnd}
      isFocused={focusedSuggestion === suggestions[i]}
    />
  ));

  return (
    <div
      className={styles.main}
      ref={usePreventTouchDefault(true, preventedEvents)}
    >
      {buttons}
    </div>
  );
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
