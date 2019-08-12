import React, { useRef } from "react";
import shuffle from "lodash/shuffle";
import PropTypes from "prop-types";
import styles from "./InstructionsTest.module.css";
import FormItem from "./FormItem";

const questionList = [
  {
    text: "What device(s) can I use in this experiment ?",
    answers: ["mouse and keyboard", "mouse only", "keyboard only"],
    correctAnswer: "keyboard only"
  },
  {
    text: "Where will the suggestion appear ?",
    answers: [
      "behind the word I am typing",
      "below the word I am typing",
      "below the input zone as buttons",
      "above the word I am typing, as buttons"
    ],
    correctAnswer: "behind the word I am typing"
  },
  {
    text: "How do I use the suggestion ?",
    answers: [
      "I press Tab once",
      "I press Tab several times",
      "I press Enter until the suggestion appears in the input zone",
      "I press Enter once"
    ],
    correctAnswer: "I press Tab once"
  },
  {
    text: "How do I delete a character ?",
    answers: [
      "I press Backspace once",
      "I press Backspace until the character disappears from the input zone",
      "I press the left arrow key once and continue typing",
      "I click with the mouse to move the caret and then"
    ],
    correctAnswer:
      "I press Backspace until the character disappears from the input zone"
  }
];

const InstructionsTest = ({ onAdvanceWorkflow, setInstructionPassed }) => {
  const { current: questions } = useRef(
    shuffle(questionList).map((q, i) => ({
      ...q,
      answers: shuffle(q.answers),
      id: `q${i}`
    }))
  );

  function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      if (data.get(question.id) !== question.correctAnswer) {
        setInstructionPassed(false);
        return;
      }
    }
    onAdvanceWorkflow();
  }

  return (
    <div className={styles.main}>
      <h4>Instruction Quizz</h4>
      <p>
        If you make a mistake, you will be sent back to the instruction page
      </p>
      <form onSubmit={onSubmit} className={styles.form}>
        {questions.map(question => {
          return <FormItem key={question.id} {...question} />;
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
