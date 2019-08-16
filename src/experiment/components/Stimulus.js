import React from "react";
import PropTypes from "prop-types";
import { totalMatchedCharsFromStart } from "../../utils/strings";
import styles from "./styles/Stimulus.module.css";

const Stimulus = ({ text, input, stimulusTextRef }) => {
  const correctCharsCount = totalMatchedCharsFromStart(text, input);

  return (
    <div className={styles.stimulus}>
      <div className={styles.content}>
        <span className={styles.sentence} ref={stimulusTextRef}>
          <span className={styles.correct}>
            {text.slice(0, correctCharsCount)}
          </span>
          <span className={styles.incorrect}>
            {text.slice(correctCharsCount, input.length)}
          </span>
          <span className={styles.text}>{text.slice(input.length)}</span>
        </span>
      </div>
    </div>
  );
};

Stimulus.propTypes = {
  text: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired,
  stimulusTextRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

Stimulus.defaultProps = {
  stimulusTextRef: undefined
};

export default Stimulus;
