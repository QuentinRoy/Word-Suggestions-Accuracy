import React, { memo } from "react";
import RadioGroup from "@material-ui/core/RadioGroup";
import PropTypes from "prop-types";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import styles from "./styles/MultipleChoiceQuestion.module.css";

const MultipleChoiceQuestion = memo(
  ({ answers, text, id, onAnswerChange, answer }) => {
    return (
      <div className={styles.main}>
        <FormControl component="fieldset">
          <FormLabel component="h3" className={styles.title}>
            {text}
          </FormLabel>
          <RadioGroup
            aria-label={text}
            name={id}
            value={answer == null ? "" : answer}
            onChange={(evt) => onAnswerChange(evt.target.value)}
          >
            {answers.map((answerText) => (
              <FormControlLabel
                key={answerText}
                value={answerText}
                control={<Radio color="primary" />}
                label={answerText}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    );
  }
);

MultipleChoiceQuestion.propTypes = {
  onAnswerChange: PropTypes.func.isRequired,
  answer: PropTypes.string,
  answers: PropTypes.arrayOf(PropTypes.string).isRequired,
  text: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

MultipleChoiceQuestion.defaultProps = { answer: undefined };

export default MultipleChoiceQuestion;
