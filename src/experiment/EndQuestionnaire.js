import React, { useState } from "react";
import Proptypes from "prop-types";
import styles from "./EndQuestionnaire.module.css";
import FormInput from "../utils/FormInput";
import { InputTypes } from "../utils/constants";

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

// return (
//   <div className={styles.main}>
//     <h3>Questionnaire</h3>
//     <form onSubmit={handleButtonClick} className={styles.endForm}>
//       <div>
//         <p>Your age:</p>
//         <div>
//           <input
//             type="input"
//             name="age"
//             value={age}
//             onChange={x => {
//               if (typeof x === "number" && x < 120 && x > 0) {
//                 setAge(x);
//               }
//             }}
//           />
//           <input type="radio" name="ageButton" />
//           <span>Prefer not to say</span>
//         </div>
//       </div>
//       <div>
//         <p>Your gender:</p>
//         <div>
//           <input
//             type="input"
//             name="gender"
//             value={gender}
//             onChange={g => {
//               if (typeof g === "string") {
//                 setGender(g);
//               }
//             }}
//           />
//           <input type="radio" name="genderRadio" />
//           <span>Prefer not to say</span>
//         </div>
//       </div>
//       <div>
//         <p>Open question</p>
//         <textarea name="openQuestion" rows="10" cols="80" />
//       </div>
//       <div>
//         <p>Closed question</p>
//         <input type="radio" name="closedQuestion" value="Answer 1" />
//         <span>Answer 1</span>
//         <input type="radio" name="closedQuestion" value="Answer 2" />
//         <span>Answer 2</span>
//         <input type="radio" name="closedQuestion" value="Answer 3" />
//         <span>Answer 3</span>
//         <input type="radio" name="closedQuestion" value="Answer 4" />
//         <span>Answer 4</span>
//       </div>
//       <input type="submit" value="Finish" />
//     </form>
//   </div>
// );
