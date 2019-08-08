import React, { useState } from "react";
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

const InstructionsTest = ({ onAdvanceWorkflow }) => {
  const [testSucceeded, setTestSucceeded] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);

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
    const data = new FormData(event.target);
    for (let i = 0; i < questionList.length; i += 1) {
      if (data.get(`${i}`) !== correctAnswers[i]) {
        console.log("error! retour aux instructions");
        setTestSucceeded(false);
        break;
      }
      setTestSucceeded(true);
    }
    setTestSubmitted(true);
  }

  console.log("testSubmitted", testSubmitted);
  console.log("testSucceeded", testSucceeded);

  return (
    <div className={styles.main}>
      <h4>Did you read the instructions carefully</h4>
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

      {testSubmitted ? (
        <div>
          {testSucceeded
            ? "You answered correctly! Here is the tutorial"
            : "You have made some mistakes, check the instructions again"}
          <button
            type="button"
            className={styles.continueButton}
            onClick={
              testSucceeded
                ? onAdvanceWorkflow()
                : console.log("retour aux instructions")
            }
          >
            {testSucceeded ? "Continue" : "Back to the instructions"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

InstructionsTest.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default InstructionsTest;
