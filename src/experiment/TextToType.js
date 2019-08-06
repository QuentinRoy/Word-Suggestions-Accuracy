import React from "react";
import PropTypes from "prop-types";
import styles from "./TextToType.module.css";

const TextToType = ({ text, correctCharsCount, input }) => {
  const isCorrect = input.trim() === text;

  return (
    <div>
      <h4>Text to type:</h4>
      <p className={styles.winnerlabel}>
        {isCorrect ? "You typed the text correctly!" : " "}
      </p>
      <div className={styles.texttotype}>
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

TextToType.propTypes = {
  text: PropTypes.string.isRequired,
  correctCharsCount: PropTypes.number.isRequired,
  input: PropTypes.string.isRequired
};

export default TextToType;
