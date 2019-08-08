import React from "react";
import PropTypes from "prop-types";
import styles from "./FormItem.module.css";

const FormItem = ({ question }) => {
  return (
    <div className={styles.questionWrapper}>
      <p>{question.questionText}</p>
      {question.answers.map(answer => {
        return (
          <div className={styles.answerWrapper}>
            <input type="radio" name={question.key} value={answer} />
            <span className={styles.formAnswer}>{answer}</span>
          </div>
        );
      })}
    </div>
  );
};

FormItem.propTypes = {
  question: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.number])
  ).isRequired
};

export default FormItem;
