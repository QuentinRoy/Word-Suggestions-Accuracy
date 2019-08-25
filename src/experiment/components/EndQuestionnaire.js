import React from "react";
import PropTypes from "prop-types";
import { withFormik } from "formik";
import Button from "@material-ui/core/Button";
import styles from "./styles/EndQuestionnaire.module.css";
import FormInput from "../../utils/FormInput";
import { InputTypes, Directions } from "../../utils/constants";

const agreementScaleAnswers = [
  "Strongly disagree",
  "Disagree",
  "Somewhat disagree",
  "Neither agree nor disagree",
  "Somewhat agree",
  "Agree",
  "Strongly agree"
];

const questions = {
  age: {
    text: "How old are you?",
    inputType: InputTypes.number,
    isAnswerRequired: false
  },
  gender: {
    text: "What is your gender?",
    inputType: InputTypes.selectInput,
    answers: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
    isAnswerRequired: false
  },
  controlsSatisfactory: {
    text:
      "The controls (keyboard and word suggestions) are satisfactory for the completion of the task",
    inputType: InputTypes.choice,
    answers: agreementScaleAnswers,
    direction: Directions.horizontal,
    isAnswerRequired: true
  },
  suggestionsAccuracy: {
    text: "The word suggestions are accurate",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true
  },
  keyboardUseEfficiency: {
    text: "The use of the keyboard is efficient in this task",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true
  },
  middleAnswer: {
    text: "Select the answer in the very middle",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true
  },
  suggestionDistraction: {
    text: "The word suggestions are distracting",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true
  },
  suggestionsUseFrequencyDesktop: {
    text:
      "I frequently use word suggestions when typing on a laptop or desktop computer",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true
  },
  suggestionsUseFrequencyMobile: {
    text: "I frequently use word suggestions when typing on a mobile phone",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true
  },
  mentalDemand: {
    text: "Mental demand",
    description: "How mentally demanding was the task?",
    inputType: InputTypes.nasaTlx,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  },
  physicalDemand: {
    text: "Physical demand",
    description: "How physically demanding was the task?",
    inputType: InputTypes.nasaTlx,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  },
  temporalDemand: {
    text: "Temporal Demand",
    description: "How hurried or rushed was the pace of the task?",
    inputType: InputTypes.nasaTlx,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  },
  performance: {
    text: "Performance",
    description:
      "How successful were you in accomplishing what you were asked to do?",
    inputType: InputTypes.nasaTlx,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
    lowLabel: "Perfect",
    highLabel: "Failure"
  },
  effort: {
    text: "Effort",
    description:
      "How hard did you have to work to accomplish your level of performance?",
    inputType: InputTypes.nasaTlx,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  },
  frustration: {
    text: "Frustration",
    description:
      "How insecure, discouraged, irritated, stressed, and annoyed were you?",
    inputType: InputTypes.nasaTlx,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  }
};

const EndQuestionnaire = ({
  handleSubmit,
  values,
  setFieldValue,
  handleBlur,
  errors,
  isValid
}) => (
  <div className={styles.main}>
    <h1>Questionnaire</h1>
    <p className={styles.instructions}>Please answer the questions below.</p>

    <form onSubmit={handleSubmit} className={styles.endForm}>
      {Object.entries(questions).map(([questionId, question]) => {
        return (
          <div className={styles.question}>
            <FormInput
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...question}
              id={questionId}
              key={questionId}
              value={values[questionId]}
              error={errors[questionId]}
              onChange={setFieldValue}
              onBlur={handleBlur}
            />
          </div>
        );
      })}
      <div className={styles.buttonWrapper}>
        <Button
          disabled={!isValid}
          className={styles.button}
          variant="contained"
          color="primary"
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  </div>
);

EndQuestionnaire.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
  isValid: PropTypes.bool.isRequired
};

const EnhancedEndQuestionnaire = withFormik({
  mapPropsToValues: () =>
    Object.entries(questions).reduce(
      (acc, [qId, question]) => ({
        ...acc,
        [qId]: question.defaultAnswer
      }),
      {}
    ),
  handleSubmit: (values, { props: { onLog, onAdvanceWorkflow } }) => {
    onLog("log", values);
    onAdvanceWorkflow();
  },
  validate: values => {
    const errors = {};
    Object.entries(values).forEach(([qId, value]) => {
      if (value == null && questions[qId].isAnswerRequired) {
        errors[qId] = "Required";
      }
    });
    return errors;
  }
})(EndQuestionnaire);

EnhancedEndQuestionnaire.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired
};

export default EnhancedEndQuestionnaire;
