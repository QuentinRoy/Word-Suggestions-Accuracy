import React, { useRef, useState } from "react";
import shuffle from "lodash/shuffle";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import styles from "./styles/StartupQuestionnaire.module.css";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import TaskPaper from "./TaskPaper";

const questions = [
  {
    text: "You will...",
    answers: ["read long paragraphs", "find typos in a text", "type sentences"],
    correctAnswer: "type sentences"
  },
  {
    text: "You must...",
    answers: [
      "type as fast and accurately as possible",
      "take all the time you need, but not make errors",
      "never use word suggestions",
      "always use word suggestions"
    ],
    correctAnswer: "type as fast and accurately as possible"
  }
];

const delayQuestions = [
  {
    text: "You will...",
    answers: [
      "need to keep your keyboard's keys pressed down longer than usual",
      "need to click on small buttons",
      "not use your keyboard",
      "need to click on words"
    ],
    correctAnswer:
      "need to keep your keyboard's keys pressed down longer than usual"
  }
];

const makeQuestions = includesDelayQuestions =>
  shuffle(
    // Mapping before shuffling to maintain consistent ids.
    (includesDelayQuestions
      ? questions
      : [...questions, ...delayQuestions]
    ).map((q, i) => ({
      ...q,
      answers: shuffle(q.answers),
      id: `q${i}`
    }))
  );

const StartupTest = ({ onSubmit, includesDelayQuestions }) => {
  const { current: shuffledQuestions } = useRef(
    // This is a bit expensive and uselessly run on every render, but that's
    // fine.
    makeQuestions(includesDelayQuestions)
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
    <TaskPaper className={styles.main}>
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
    </TaskPaper>
  );
};

StartupTest.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  includesDelayQuestions: PropTypes.bool.isRequired
};

export default StartupTest;
