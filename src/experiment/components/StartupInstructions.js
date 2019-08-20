import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Appear from "./Appear";
import styles from "./styles/StartupInstructions.module.css";

const StartupInstructions = ({ onStart, numberOfPracticeTasks }) => {
  const [step, setStep] = useState(1);

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
      <Appear.Fragment component="p">
        Moreover, you will be assigned an <strong>impairment</strong> factor.{" "}
        <Appear.Fragment component="span">
          You will need to <strong>keep your keyboard key pressed down</strong>{" "}
          for a certain period of time before the system reacts.{" "}
        </Appear.Fragment>
      </Appear.Fragment>
      <Appear.Fragment component="p">
        If you release the key before this delay is passed, nothing will happen.
      </Appear.Fragment>
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
        <strong>remain focused</strong>.{" "}
        <Appear.Fragment component="span">
          In particular, time is measured during typing tasks.
        </Appear.Fragment>
      </Appear.Fragment>
      <Appear.Fragment component="p">
        <strong>Please do not stop typing during typing tasks.</strong>{" "}
      </Appear.Fragment>{" "}
      <Appear.Fragment component="p">
        You may take a break on information screens.
      </Appear.Fragment>
      <br />
      <Appear.Fragment component="p">
        There is a progress bar at the bottom of the screen.
      </Appear.Fragment>
    </>
  );

  const totalSteps = 13;

  return (
    <div className={styles.main}>
      <Appear currentStep={step}>
        <h1>Instructions</h1>
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
    </div>
  );
};

StartupInstructions.propTypes = {
  onStart: PropTypes.func.isRequired,
  numberOfPracticeTasks: PropTypes.number.isRequired
};

export default StartupInstructions;
