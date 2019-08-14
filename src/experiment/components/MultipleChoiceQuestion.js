import React, { memo } from "react";
import PropTypes from "prop-types";
import styles from "./styles/MultipleChoiceQuestion.module.css";
import MultipleChoiceAnswer from "./MultipleChoiceAnswer";

const MultipleChoiceQuestion = memo(
  ({ answers, text, id, onAnswerChange, answer }) => {
    return (
      <div className={styles.questionWrapper}>
        <h3>{text}</h3>
        {answers.map(answerText => (
          <MultipleChoiceAnswer
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
  }
);

MultipleChoiceQuestion.propTypes = {
  onAnswerChange: PropTypes.func.isRequired,
  answer: PropTypes.string,
  answers: PropTypes.arrayOf(PropTypes.string).isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};

MultipleChoiceQuestion.defaultProps = { answer: undefined };

export default MultipleChoiceQuestion;
