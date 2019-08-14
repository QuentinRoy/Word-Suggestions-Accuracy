import React, { useRef } from "react";
import shortid from "shortid";
import PropTypes from "prop-types";
import styles from "./styles/MultipleChoiceAnswer.module.css";

const MultipleChoiceAnswer = ({ name, label, onChange, checked }) => {
  const { current: answerId } = useRef(shortid.generate());
  return (
    <div className={styles.answerWrapper}>
      <label htmlFor={answerId} className={styles.label}>
        <input
          checked={checked}
          type="radio"
          name={name}
          id={answerId}
          value={label}
          onChange={e => {
            onChange(e.target.checked);
          }}
        />
        <span className={styles.checkMark} />
        {label}
      </label>
    </div>
  );
};

MultipleChoiceAnswer.propTypes = {
  checked: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default MultipleChoiceAnswer;
