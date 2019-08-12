import React from "react";
import PropTypes from "prop-types";
import shortid from "shortid";
import styles from "./FormItem.module.css";

const FormItem = ({ answers, text, id }) => {
  return (
    <div className={styles.questionWrapper}>
      <p>{text}</p>
      {answers.map((answer, i) => {
        const answerId = shortid.generate();
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className={styles.answerWrapper}>
            <label htmlFor={answerId} className={styles.container}>
              <input type="radio" name={id} id={answerId} value={answer} />
              <span className={styles.checkmark} />
              {answer}
            </label>
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
