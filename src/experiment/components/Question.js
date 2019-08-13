import React, { memo } from "react";
import PropTypes from "prop-types";

import styles from "./styles/Question.module.css";
import Answer from "./Answer";

const Question = memo(({ answers, text, id, onAnswerChange, answer }) => {
  return (
    <div className={styles.questionWrapper}>
      <p>{text}</p>
      {answers.map(answerText => (
        <Answer
          label={answerText}
          name={id}
          key={answerText}
          checked={answerText === answer}
          onChange={isChecked => {
            if (isChecked) onAnswerChange(answerText);
          }}
        />
      ))}
    </div>
  );
});

Question.propTypes = {
  onAnswerChange: PropTypes.func.isRequired,
  answer: PropTypes.string,
  answers: PropTypes.arrayOf(PropTypes.string).isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};

Question.defaultProps = { answer: undefined };

export default Question;
