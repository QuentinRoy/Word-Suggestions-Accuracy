import React, { useRef, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./styles/SuggestionsBar.module.scss";
import usePreventTouchDefault from "../hooks/usePreventTouchDefault";

const buttonPadding = 10;

const Suggestionbutton = ({
  suggestion,
  onSelectionStart,
  onSelectionEnd,
  isFocused
}) => {
  const ref = useRef();
  useLayoutEffect(() => {
    const { current: button } = ref;
    const span = button.querySelector("span");
    // offsetWidth does not take scale into account, so we can safely use it
    // to compute the new one.
    const ratio = (button.offsetWidth - buttonPadding * 2) / span.offsetWidth;
    span.style.transform = `scale(${Math.min(ratio, 1)})`;
  }, [suggestion]);

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
      ref={ref}
      type="button"
      className={classNames(styles.button, { [styles.focused]: isFocused })}
      tabIndex={-1}
      onTouchStart={selStart}
      onTouchEnd={selEnd}
      onTouchCancel={selEnd}
    >
      <span className={styles.buttonContent}>
        {suggestion != null ? suggestion.trim() : null}
      </span>
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
      // We cannot use suggestion as a key, more than one suggestion may be
      // null. The index is fine, and also limits re-rendering.
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
