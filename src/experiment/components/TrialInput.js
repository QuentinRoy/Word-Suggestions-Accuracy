import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import last from "lodash/last";
import styles from "./styles/TrialInput.module.css";

const lastWordLength = str => last(str.split(" ")).length;

const TrialInput = forwardRef(
  (
    {
      input,
      hasErrors,
      isFocused,
      shouldCaretBlink,
      suggestion,
      suggestionRef
    },
    ref
  ) => {
    const suggestionContent =
      suggestion == null ? "" : suggestion.slice(lastWordLength(input));
    return (
      <div
        ref={ref}
        className={classNames({
          [styles.trialInput]: true,
          [styles.focused]: isFocused,
          [styles.error]: hasErrors
        })}
      >
        <span className={styles.inputText}>{input}</span>
        {isFocused ? (
          // Having a key on the caret div make sure the animation is reset each
          // time the input changes.
          <div className={styles.caretWrapper}>
            <div
              className={classNames({
                [styles.caret]: true,
                [styles.blinking]: shouldCaretBlink
              })}
              key={input}
            />
          </div>
        ) : null}
        {suggestionContent !== "" ? (
          <span
            className={styles.suggestion}
            key={suggestionContent}
            ref={suggestionRef}
          >
            {suggestionContent}
          </span>
        ) : null}
      </div>
    );
  }
);

TrialInput.propTypes = {
  input: PropTypes.string.isRequired,
  isFocused: PropTypes.bool.isRequired,
  shouldCaretBlink: PropTypes.bool.isRequired,
  hasErrors: PropTypes.bool.isRequired,
  suggestion: PropTypes.string,
  suggestionRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

TrialInput.defaultProps = {
  suggestion: null,
  suggestionRef: undefined
};

export default TrialInput;
