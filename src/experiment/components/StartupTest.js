import React, { useRef, useState } from "react";
import shuffle from "lodash/shuffle";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import styles from "./styles/StartupTest.module.css";
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

const StartupTest = ({ onSubmit }) => {
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
    const isCorrect = questions.every(q => answers[q.id] === q.correctAnswer);
    onSubmit(
      isCorrect,
      questions.map(q => ({
        id: q.id,
        answer: answers[q.id],
        question: q.text,
        isCorrect: answers[q.id] === q.correctAnswer
      }))
    );
  }

  return (
    <div className={styles.main}>
      <h2>Startup Questionnaire</h2>
      <p className={styles.instructions}>Please answer the questions below</p>
      <form onSubmit={onSubmitForm} className={styles.form}>
        {questions.map(question => {
          return (
            <Question
              key={question.id}
              answers={question.answers}
              id={question.id}
              text={question.text}
              correctAnswer={question.correctAnswer}
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

StartupTest.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default StartupTest;
