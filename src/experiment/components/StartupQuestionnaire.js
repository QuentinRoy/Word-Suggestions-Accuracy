import React, { useRef, useState } from "react";
import shuffle from "lodash/shuffle";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import styles from "./styles/StartupQuestionnaire.module.css";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";

const questions = [
  {
    text: "You will...",
    answers: ["read long paragraphs", "find typos", "write text"],
    correctAnswer: "write text"
  },
  {
    text: "You must...",
    answers: [
      "go as fast possible, while still being accurate",
      "take all the time you need, but not make errors",
      "not use word suggestions",
      "use word suggestions"
    ],
    correctAnswer: "go as fast possible"
  },
  {
    text: "To interact...",
    answers: [
      "you will need to keep keys down longer than usual",
      "you will need to click on small buttons",
      "you will not use your keyboard",
      "you will need to click on words"
    ],
    correctAnswer: "you will need to keep keys down longer than usual"
  }
];

const StartupTest = ({ onSubmit }) => {
  const { current: shuffledQuestions } = useRef(
    shuffle(
      // Mapping before shuffling to maintain consistent ids.
      questions.map((q, i) => ({
        ...q,
        answers: shuffle(q.answers),
        id: `q${i}`
      }))
    )
  );
  const [answers, setAnswers] = useState({});

  function onSubmitForm(event) {
    event.preventDefault();
    const isCorrect = shuffledQuestions.every(
      q => answers[q.id] === q.correctAnswer
    );
    onSubmit(
      isCorrect,
      shuffledQuestions.map(q => ({
        id: q.id,
        answer: answers[q.id],
        question: q.text,
        isCorrect: answers[q.id] === q.correctAnswer
      }))
    );
  }

  return (
    <div className={styles.main}>
      <h1>Startup Questionnaire</h1>
      <p className={styles.instructions}>Please answer the questions below.</p>
      <form onSubmit={onSubmitForm} className={styles.form}>
        {shuffledQuestions.map(question => {
          return (
            <MultipleChoiceQuestion
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
            disabled={shuffledQuestions.some(q => answers[q.id] == null)}
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
};

StartupTest.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default StartupTest;
