import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./styles/TrialInput.module.css";
import { totalMatchedCharsFromStart } from "../../utils/strings";

const TrialInput = ({ input, text, isFocused, shouldCaretBlink }) => {
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
    </div>
  );
};

TrialInput.propTypes = {
  input: PropTypes.string.isRequired,
  isFocused: PropTypes.bool.isRequired,
  shouldCaretBlink: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
};

export default TrialInput;
