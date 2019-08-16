import React, { useState } from "react";
import Proptypes from "prop-types";
import { Formik } from "formik";
import Button from "@material-ui/core/Button";
import styles from "./styles/EndQuestionnaire.module.css";
import FormInput from "../../utils/FormInput";
import { InputTypes } from "../../utils/constants";

const assertionsAnswers = [
  "Strongly disagree",
  "Disagree",
  "Somewhat disagree",
  "Neither agree nor disagree",
  "Somewhat agree",
  "Agree",
  "Strongly agree"
];
const questions = [
  {
    text: "How old are you?",
    inputType: InputTypes.standardInput,
    questionRef: "age",
    isAnswerRequired: false,
    key: 0
  },
  {
    text: "What is your gender?",
    inputType: InputTypes.selectInput,
    answers: ["Male", "Female", "Other", "Prefer not to say"],
    questionRef: "gender",
    isAnswerRequired: true,
    key: 1
  },
  {
    text:
      "The controls (keyboard and word suggestions) are satisfactory for the completion of the task",
    inputType: InputTypes.radioButton,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "controlsSatisfactory",
    key: 2
  },
  {
    text: "The word suggestions are accurate",
    inputType: InputTypes.radioButton,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "suggestionsAccuracy",
    key: 3
  },
  {
    text: "Select the answer in the very middle",
    inputType: InputTypes.radioButton,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "middleAnswer",
    key: 4
  },
  {
    text: "The use of the keyboard is efficient in this task",
    inputType: InputTypes.radioButton,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "keyboardUseEfficiency",
    key: 5
  },
  {
    text:
      "I frequently use word suggestions when typing on a laptop or desktop computer",
    inputType: InputTypes.radioButton,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "suggestionsUseFrequencyDesktop",
    key: 6
  },
  {
    text: "I frequently use word suggestions when typing on a mobile phone",
    inputType: InputTypes.radioButton,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "suggestionsUseFrequencyMobile",
    key: 7
  },
  {
    text: "Mental demand",
    inputType: InputTypes.slider,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "mentalDemand",
    marks: [
      { value: 5, label: "Very low" },
      { value: 100, label: "Very high" }
    ],
    key: 8
  },
  {
    text: "Physical demand",
    inputType: InputTypes.slider,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "physicalDemand",
    marks: [
      { value: 5, label: "Very low" },
      { value: 100, label: "Very high" }
    ],
    key: 9
  },
  {
    text: "Temporal Demand",
    inputType: InputTypes.slider,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "temporalDemand",
    marks: [
      { value: 5, label: "Very low" },
      { value: 100, label: "Very high" }
    ],
    key: 10
  },
  {
    text: "Performance",
    inputType: InputTypes.slider,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "performance",
    marks: [{ value: 5, label: "Perfect" }, { value: 100, label: "Failure" }],
    key: 11
  },
  {
    text: "Effort",
    inputType: InputTypes.slider,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "effort",
    marks: [
      { value: 5, label: "Very low" },
      { value: 100, label: "Very high" }
    ],
    key: 12
  },
  {
    text: "Frustration",
    inputType: InputTypes.slider,
    answers: assertionsAnswers,
    isAnswerRequired: true,
    questionRef: "frustration",
    marks: [
      { value: 5, label: "Very low" },
      { value: 100, label: "Very high" }
    ],
    key: 13
  }
];

const EndQuestionnaire = ({ onAdvanceWorkflow, onLog }) => {
  const [values, setValues] = useState({
    age: "",
    gender: "",
    controlsSatisfactory: "",
    suggestionsAccuracy: "",
    middleAnswer: "",
    keyboardUseEfficiency: "",
    suggestionsUseFrequencyDesktop: "",
    suggestionsUseFrequencyMobile: "",
    mentalDemand: 50,
    physicalDemand: 50,
    temporalDemand: 50,
    performance: 50,
    effort: 50,
    frustration: 50
  });

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleChangeCheck = name => event => {
    if (event.target.checked) {
      setValues({ ...values, [name]: event.target.value });
    } else {
      setValues({ ...values, [name]: "" });
    }
  };

  const handleChangeSlider = name => (event, newValue) => {
    setValues({ ...values, [name]: newValue });
  };

  return (
    <div className={styles.main}>
      <h3>Questionnaire</h3>
      <Formik
        initialValues={{ values }}
        onSubmit={() => {
          if (!Object.values(values).includes("")) {
            onLog("Questionnaire", values);
            onAdvanceWorkflow();
          }
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className={styles.endForm}>
            {questions.map(question => {
              return (
                <FormInput
                  className={styles.formInput}
                  key={question.questionRef}
                  text={question.text}
                  values={values}
                  inputType={question.inputType}
                  name={`${question.key}`}
                  answers={"answers" in question ? question.answers : null}
                  handleChange={handleChange}
                  handleChangeCheck={handleChangeCheck}
                  handleChangeSlider={handleChangeSlider}
                  isAnswerRequired={question.isAnswerRequired}
                  questionRef={question.questionRef}
                  marks={"marks" in question ? question.marks : null}
                />
              );
            })}
            <div className={styles.buttonWrapper}>
              <Button
                className={styles.button}
                variant="contained"
                color="primary"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
    //
  );
};

EndQuestionnaire.propTypes = {
  onAdvanceWorkflow: Proptypes.func.isRequired,
  onLog: Proptypes.func.isRequired
};

export default EndQuestionnaire;
