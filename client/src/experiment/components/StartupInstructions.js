import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Appear from "./Appear";
import styles from "./styles/StartupInstructions.module.css";
import TaskPaper from "./TaskPaper";

const StartupInstructions = ({
  onStart,
  numberOfPracticeTasks,
  doNotShowDelayInstructions,
}) => {
  const [step, setStep] = useState(0);

  const instructionElements = (
    <>
      <Appear.Fragment component="p">
        In this experiment, you will be typing sentences.
      </Appear.Fragment>
      <Appear.Fragment component="p">
        You must type them <strong>as fast and accurately as possible</strong>.
      </Appear.Fragment>
      <Appear.Fragment component="p">
        Suggestions of words will appear as you type. It is up to you to use
        them or not.
      </Appear.Fragment>
      {doNotShowDelayInstructions ? null : (
        <>
          <Appear.Fragment component="p">
            Moreover, you may be assigned an <strong>impairment</strong> factor.
            You may need to <strong>keep your keyboard key pressed down</strong>{" "}
            for a certain period of time before the system reacts.{" "}
          </Appear.Fragment>
          <Appear.Fragment component="p">
            If you release the key before this delay is passed, nothing will
            happen.
          </Appear.Fragment>
        </>
      )}
      <br />
      <Appear.Fragment component="p">
        After a short tutorial, you will train on{" "}
        <strong>{numberOfPracticeTasks} practice trials</strong>, before moving
        to the actual experiment.
      </Appear.Fragment>
      <Appear.Fragment component="p">
        At the end of the experiment, we will ask you to answer a few questions,
        then we will measure your &ldquo;natural&rdquo; typing speed.
      </Appear.Fragment>
      <br />
      <Appear.Fragment component="p">
        Once the experiment has started it is very important that you{" "}
        <strong>remain focused</strong>. In particular, time is measured during
        typing tasks.
      </Appear.Fragment>
      <Appear.Fragment component="p">
        <strong>Please do not stop typing during typing tasks.</strong>{" "}
      </Appear.Fragment>{" "}
      <Appear.Fragment component="p">
        You may take a break on information screens.
      </Appear.Fragment>
    </>
  );

  const totalSteps = doNotShowDelayInstructions ? 8 : 10;

  return (
    <TaskPaper className={styles.main}>
      <Appear currentStep={step}>
        <h1>Instructions</h1>
        <p className={styles.instructions}>
          Please carefully read the instructions below. Use the
          &ldquo;next&rdquo; button at the bottom of the screen to step through
          them.
        </p>
        {instructionElements}
        <div className={styles.buttonWrapper}>
          <Button
            className={styles.button}
            variant="contained"
            color="primary"
            type="button"
            disabled={step >= totalSteps}
            onClick={() => setStep(step + 1)}
          >
            Next
          </Button>
          <Button
            className={styles.button}
            variant="contained"
            color="primary"
            type="button"
            disabled={step < totalSteps}
            onClick={onStart}
          >
            Continue
          </Button>
        </div>
      </Appear>
    </TaskPaper>
  );
};

StartupInstructions.propTypes = {
  doNotShowDelayInstructions: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  numberOfPracticeTasks: PropTypes.number.isRequired,
};

export default StartupInstructions;
