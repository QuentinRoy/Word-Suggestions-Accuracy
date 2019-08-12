import React, { useState } from "react";
import Proptypes from "prop-types";
import styles from "./styles/EndQuestionnaire.module.css";
import FormInput from "../../utils/FormInput";
import { InputTypes } from "../../utils/constants";

const EndQuestionnaire = ({ onAdvanceWorkflow, onLog }) => {
  const [age, setAge] = useState("");

  const questions = [];
  questions.push({
    label: "Age",
    inputType: InputTypes.standardInput,
    typeOfAnswer: "number",
    value: age,
    method: setAge,
    answerRequired: false,
    key: questions.length
  });
  questions.push({
    label: "Gender",
    inputType: InputTypes.selectInput,
    answers: ["Male", "Female", "Other", "Prefer not to say"],
    answerRequired: true,
    key: questions.length
  });
  questions.push({
    label: "Open question",
    inputType: InputTypes.textarea,
    answerRequired: true,
    key: questions.length
  });
  questions.push({
    label: "Closed question",
    inputType: InputTypes.radioButton,
    answers: ["a", "b", "c", "d"],
    answerRequired: true,
    key: questions.length
  });

  const handleButtonClick = event => {
    event.preventDefault();
    const data = new FormData(event.target);

    const submittedAnswers = [];
    let finishExperiment = true;

    for (let i = 0; i < questions.length; i += 1) {
      if (
        (data.get(`${i}`) === null || data.get(`${i}`) === "") &&
        questions[i].answerRequired
      ) {
        finishExperiment = false;
      } else {
        submittedAnswers.push({
          label: questions[i].label,
          answer: data.get(`${i}`)
        });
      }
    }

    if (finishExperiment) {
      onLog("EndQuestionsData", submittedAnswers);
      onAdvanceWorkflow();
    }
  };

  return (
    <div className={styles.main}>
      <h3>Questionnaire</h3>
      <form onSubmit={handleButtonClick} className={styles.endForm}>
        {questions.map(question => {
          return (
            <div
              key={questions.key}
              className={`grid-container ${styles.formInput}`}
            >
              <p key={questions.key}>
                {question.label}
                <span style={{ color: "red" }}>
                  {question.answerRequired ? "*" : null}
                </span>
              </p>
              <FormInput
                key={questions.key}
                inputType={question.inputType}
                value={"value" in question ? question.value : ""}
                name={`${question.key}`}
                label={"buttonLabel" in question ? question.buttonLabel : null}
                answers={"answers" in question ? question.answers : null}
                method={"method" in question ? question.method : null}
                typeOfAnswer={
                  "typeOfAnswer" in question ? question.typeOfAnswer : null
                }
              />
            </div>
          );
        })}
        <p style={{ color: "red" }}>*: an answer is required</p>
        <input type="submit" value="Finish" className={styles.submitButton} />
      </form>
    </div>
  );
};

EndQuestionnaire.propTypes = {
  onAdvanceWorkflow: Proptypes.func.isRequired,
  onLog: Proptypes.func.isRequired
};

export default EndQuestionnaire;
