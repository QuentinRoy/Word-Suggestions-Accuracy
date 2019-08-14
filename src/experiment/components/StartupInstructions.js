import React, { useState, cloneElement } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Appear from "./Appear";
import styles from "./styles/StartupInstructions.module.css";
import { numberOfPracticeTasks } from "../../utils/constants";

const instructionsList = [
  <p>In this experiment, you will be typing sentences.</p>,
  <p>
    You must type them <strong>as fast as possible</strong>,{" "}
    <strong>while minimizing errors</strong>.
  </p>,
  <p>
    Suggestions of words will appear as you type. It is up to you to use them or
    not.
  </p>,
  <p>
    Moreover, you will be assigned an <strong>impairment</strong> factor.
  </p>,
  <p>
    You will need to <strong>keep your keyboard key pressed down</strong> for a
    certain period of time before the system reacts.
  </p>,
  <p>
    If you release the key before this delay is passed, nothing will happen.
  </p>,
  <p>
    After a short tutorial, you will train on{" "}
    <strong>{numberOfPracticeTasks} practice trials</strong>, before moving to
    the actual experiment.
  </p>,
  <p>
    At the end of the experiment, we will ask you to answer a few questions,
    then measure your &ldquo;natural&rdquo; typing speed.
  </p>
].map(
  // These will be an array of element provided as children. As a result they
  // need a key.
  (elt, i) => cloneElement(elt, { key: i })
);

const StartupInstructions = ({ onStart }) => {
  const [step, setStep] = useState(1);

  return (
    <div className={styles.main}>
      <h1>Instructions</h1>
      <Appear currentStep={step}>{instructionsList}</Appear>
      <div className={styles.buttonWrapper}>
        <Button
          className={styles.button}
          variant="contained"
          color="primary"
          type="button"
          disabled={step >= instructionsList.length}
          onClick={() => setStep(step + 1)}
        >
          Next
        </Button>
        <Button
          className={styles.button}
          variant="contained"
          color="primary"
          type="button"
          disabled={step < instructionsList.length}
          onClick={onStart}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

StartupInstructions.propTypes = {
  onStart: PropTypes.func.isRequired
};

export default StartupInstructions;
