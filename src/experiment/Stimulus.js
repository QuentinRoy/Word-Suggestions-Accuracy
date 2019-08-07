import React from "react";
import PropTypes from "prop-types";
import { totalMatchedCharsFromStart } from "../utils/strings";
import styles from "./Stimulus.module.css";

const Stimulus = ({ text, input }) => {
  const correctCharsCount = totalMatchedCharsFromStart(text, input);

  return (
    <div>
      <h4>Text to type:</h4>
      <div className={styles.stimulus}>
        <span className={styles.correct}>
          {text.slice(0, correctCharsCount)}
        </span>
        <span className={styles.incorrect}>
          {text.slice(correctCharsCount, input.length)}
        </span>
        <span className={styles.text}>{text.slice(input.length)}</span>
      </div>
    </div>
  );
};

Stimulus.propTypes = {
  text: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired
};

export default Stimulus;
