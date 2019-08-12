import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./styles/TrialInput.module.css";

const extractWord = str => {
  const newStr = str.split(" ");
  return newStr[newStr.length - 1].length;
};

const TrialInput = ({ input, shouldCaretBlink, suggestion }) => (
  <div className={`${styles.trialInput} ${styles.focused}`}>
    {input}
    {/* Having a key on the caret div make sure the animation is reset each
   time the input changes. */}
    <div className={styles.caretWrapper}>
      <div
        className={classNames({
          [styles.caret]: true,
          [styles.blinking]: shouldCaretBlink
        })}
        key={input}
      />
    </div>
    <span style={{ color: "grey" }}>
      {input === "" ? suggestion : suggestion.slice(extractWord(input))}
    </span>
  </div>
);

TrialInput.propTypes = {
  input: PropTypes.string.isRequired,
  shouldCaretBlink: PropTypes.bool.isRequired,
  suggestion: PropTypes.string.isRequired
};

export default TrialInput;
