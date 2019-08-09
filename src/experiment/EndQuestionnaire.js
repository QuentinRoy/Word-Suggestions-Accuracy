import React, { useState } from "react";
import Proptypes from "prop-types";
import styles from "./EndQuestionnaire.module.css";
import FormInput from "../utils/FormInput";

const EndQuestionnaire = ({ onAdvanceWorkflow, onLog }) => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const questions = [];
  questions.push({
    label: "Age",
    sublabel: "(can be left empty)",
    inputType: "standardInput",
    typeOfAnswer: "number",
    value: age,
    method: setAge,
    key: questions.length
  });
  questions.push({
    label: "Gender",
    inputType: "selectInput",
    value: gender,
    method: setGender,
    answers: ["Male", "Female", "Other", "Prefer not to say"],
    key: questions.length
  });
  questions.push({
    label: "Open question",
    inputType: "textarea",
    rows: 10,
    cols: 100,
    key: questions.length
  });
  questions.push({
    label: "Closed question",
    inputType: "radioButton",
    answers: ["a", "b", "c", "d"],
    key: questions.length
  });

  const handleButtonClick = event => {
    event.preventDefault();
    const data = new FormData(event.target);

    const submittedAnswers = [];
    let finishExperiment = true;

    for (let i = 0; i < questions.length; i += 1) {
      if (
        data.get(`${i}`) === "" &&
        !(
          "typeOfAnswerRequired" in questions[i] &&
          typeof data.get(`${i}`) !== typeof questions[i].typeOfAnswerRequired
        )
      ) {
        finishExperiment = false;
      } else {
        submittedAnswers.push(data.get(`${i}`));
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
              <p>{question.label}</p>
              {"sublabel" in question ? (
                <span className={styles.sublabel}>{question.sublabel}</span>
              ) : null}
              <FormInput
                inputType={question.inputType}
                value={"value" in question ? question.value : ""}
                name={`${question.key}`}
                rows={"rows" in question ? `${question.rows}` : null}
                cols={"cols" in question ? `${question.cols}` : null}
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
