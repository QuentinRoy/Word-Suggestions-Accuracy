import React from "react";
import PropTypes from "prop-types";
import { totalMatchedCharsFromStart } from "../utils/strings";
import styles from "./Stimulus.module.css";

const Stimulus = ({ text, input }) => {
  const correctCharsCount = totalMatchedCharsFromStart(text, input);

  return (
    <div className={styles.stimulus}>
      <div className={styles.content}>
        <h3 className={styles.instructions}>Please type the text below:</h3>
        <p className={styles.sentence}>
          <span className={styles.correct}>
            {text.slice(0, correctCharsCount)}
          </span>
          <span className={styles.incorrect}>
            {text.slice(correctCharsCount, input.length)}
          </span>
          <span className={styles.text}>{text.slice(input.length)}</span>
        </p>
      </div>
    </div>
  );
};

Stimulus.propTypes = {
  text: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired
};

export default Stimulus;
