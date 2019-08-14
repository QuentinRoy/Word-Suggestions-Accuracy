import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./styles/TrialInput.module.css";
import { totalMatchedCharsFromStart } from "../../utils/strings";

const extractWord = str => {
  const newStr = str.split(" ");
  return newStr[newStr.length - 1].length;
};

const TrialInput = ({
  input,
  text,
  isFocused,
  shouldCaretBlink,
  suggestion
}) => {
  const isError = totalMatchedCharsFromStart(text, input) !== input.length;

  return (
    <div
      className={classNames({
        [styles.trialInput]: true,
        [styles.focused]: isFocused && !isError,
        [styles.error]: isFocused && isError
      })}
    >
      {input}
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
        <span style={{ color: "grey" }}>
          {input === "" ? suggestion : suggestion.slice(extractWord(input))}
        </span>
      ) : null}
    </div>
  );
};

TrialInput.propTypes = {
  input: PropTypes.string.isRequired,
  isFocused: PropTypes.bool.isRequired,
  shouldCaretBlink: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  suggestion: PropTypes.string.isRequired
};

export default TrialInput;
