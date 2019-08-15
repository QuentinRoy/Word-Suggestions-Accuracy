import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import last from "lodash/last";
import styles from "./styles/TrialInput.module.css";

const lastWordLength = str => last(str.split(" ")).length;

const TrialInput = ({
  input,
  hasErrors,
  isFocused,
  shouldCaretBlink,
  suggestion
}) => {
  return (
    <div
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
      {suggestion != null ? (
        <span className={styles.suggestion}>
          {input === "" ? suggestion : suggestion.slice(lastWordLength(input))}
        </span>
      ) : null}
    </div>
  );
};

TrialInput.propTypes = {
  input: PropTypes.string.isRequired,
  isFocused: PropTypes.bool.isRequired,
  shouldCaretBlink: PropTypes.bool.isRequired,
  hasErrors: PropTypes.bool.isRequired,
  suggestion: PropTypes.string
};

TrialInput.defaultProps = {
  suggestion: null
};

export default TrialInput;
