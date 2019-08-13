import React, { useRef, useState } from "react";
import shuffle from "lodash/shuffle";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import styles from "./styles/InstructionsTest.module.css";
import Question from "./Question";

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
      "I click with the mouse to move the caret and then replace the character"
    ],
    correctAnswer:
      "I press Backspace until the character disappears from the input zone"
  }
];

const InstructionsTest = ({ onSubmit }) => {
  const { current: questions } = useRef(
    shuffle(
      questionList.map((q, i) => ({
        ...q,
        answers: shuffle(q.answers),
        id: `q${i}`
      }))
    )
  );
  const [answers, setAnswers] = useState({});

  function onSubmitForm(event) {
    event.preventDefault();
    const isCorrect = questions.every(
      question => answers[question.id] === question.correctAnswer
    );
    onSubmit(isCorrect);
  }

  return (
    <div className={styles.main}>
      <h4>Instruction Quizz</h4>
      <p>
        If you make a mistake, you will be sent back to the instruction page
      </p>
      <form onSubmit={onSubmitForm} className={styles.form}>
        {questions.map(question => {
          return (
            <Question
              key={question.id}
              {...question}
              answer={answers[question.id]}
              onAnswerChange={newAnswer => {
                setAnswers({ ...answers, [question.id]: newAnswer });
              }}
            />
          );
        })}
        <div className={styles.submitButtonWrapper}>
          <Button
            className={styles.button}
            disabled={questions.some(q => answers[q.id] == null)}
            variant="contained"
            color="primary"
            type="submit"
          >
            Start
          </Button>
        </div>
      </form>
    </div>
  );
};

InstructionsTest.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default InstructionsTest;
