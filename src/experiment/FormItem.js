import React from "react";
import PropTypes from "prop-types";
import styles from "./FormItem.module.css";

const FormItem = ({ answers, text, id }) => {
  return (
    <div className={styles.questionWrapper}>
      <p>{text}</p>
      {answers.map((answer, i) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className={styles.answerWrapper}>
            <input type="radio" name={id} value={answer} />
            <span className={styles.formAnswer}>{answer}</span>
          </div>
        );
      })}
    </div>
  );
};

FormItem.propTypes = {
  answers: PropTypes.arrayOf(PropTypes.string).isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};

export default FormItem;
