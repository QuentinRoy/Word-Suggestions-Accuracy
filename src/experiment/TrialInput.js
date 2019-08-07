import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./TrialInput.module.css";

const TrialInput = ({ input, isFocused, shouldCaretBlink }) => (
  <div
    className={
      isFocused ? `${styles.trialInput} ${styles.focused}` : styles.trialInput
    }
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

TrialInput.propTypes = {
  input: PropTypes.string.isRequired,
  isFocused: PropTypes.bool.isRequired,
  shouldCaretBlink: PropTypes.bool.isRequired
};

export default TrialInput;
