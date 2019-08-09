import React from "react";
import PropTypes from "prop-types";
import styles from "./InstructionsTest.module.css";
import FormItem from "./FormItem";

let questionList = [
  {
    questionText: "What device(s) can I use in this experiment ?",
    answers: ["mouse and keyboard", "mouse only", "keyboard only"],
    key: 0
  },
  {
    questionText: "Where will the suggestion appear ?",
    answers: [
      "behind the word I am typing",
      "below the word I am typing",
      "below the input zone as buttons",
      "above the word I am typing, as buttons"
    ],
    key: 1
  },
  {
    questionText: "How do I use the suggestion ?",
    answers: [
      "I press Tab once",
      "I press Tab several times",
      "I press Enter until the suggestion appears in the input zone",
      "I press Enter once"
    ],
    key: 2
  },
  {
    questionText: "How do I delete a character ?",
    answers: [
      "I press Backspace once",
      "I press Backspace until the character disappears from the input zone",
      "I press the left arrow key once and continue typing",
      "I click with the mouse to move the caret and then"
    ],
    key: 3
  }
];

const shuffleArray = array => {
  const tmpArray = array;
  for (let i = 0; i < tmpArray.length; i += 1) {
    const j = Math.floor(Math.random() * tmpArray.length);
    const temp = tmpArray[i];
    tmpArray[i] = tmpArray[j];
    tmpArray[j] = temp;
  }
  return tmpArray;
};

const InstructionsTest = ({ onAdvanceWorkflow, setInstructionPassed }) => {
  const correctAnswers = [
    "keyboard only",
    "behind the word I am typing",
    "I press Tab once",
    "I press Backspace until the character disappears from the input zone"
  ];

  questionList = shuffleArray(questionList);
  for (let i = 0; i < questionList.length; i += 1) {
    questionList[i].answers = shuffleArray(questionList[i].answers);
  }

  function verifyAnswers(event) {
    event.preventDefault();
    let success = true;
    const data = new FormData(event.target);
    for (let i = 0; i < questionList.length; i += 1) {
      if (data.get(`${i}`) !== correctAnswers[i]) {
        setInstructionPassed(false);
        success = false;
      }
    }
    if (success) onAdvanceWorkflow();
  }

  return (
    <div className={styles.main}>
      <h4>Instruction Quizz</h4>
      <p>
        If you make a mistake, you will be sent back to the instruction page
      </p>
      <form onSubmit={verifyAnswers} className={styles.form}>
        {questionList.map(question => {
          return <FormItem question={question} />;
        })}
        <div className={styles.submitButtonWrapper}>
          <input
            className={styles.submitButton}
            type="submit"
            value="Submit answers"
          />
        </div>
      </form>
    </div>
  );
};

InstructionsTest.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  setInstructionPassed: PropTypes.func.isRequired
};

export default InstructionsTest;
