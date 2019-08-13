import React, { useState, cloneElement } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Appear from "./Appear";
import styles from "./styles/Instructions.module.css";

const instructionsList = [
  <p>
    In this experiment we are simulating a typing task where you have to enter a
    given text with suggestions to help you out. Note that during the trials you
    can only use your keyboard.
  </p>,
  <p>
    A suggested word will appear behind your input every time you enter a key.
    You can use this suggestion by tapping the &ldquo;Tab&rdquo; key on your
    keyboard and it will complete your current word.\n You will then be able to
    type again.
  </p>,
  <p>
    You may or may not experience some delay when typing before characters show
    up on your screen. If you have some, make sure to press the key on your
    keyboard until the character appears on screen.
    <br />
    Once it has appeared, you can release the key and move on to the next one.
  </p>,
  <p>
    Only the &ldquo;Tab&rdquo; key is guaranteed to not have any delay and allow
    you to use the suggested word quickly.
  </p>,
  <p>
    As you type, the given text to type and the border of the input zone will
    change color according to whether or not you enter the text without mistake.
  </p>,
  <p>
    If you make any error, all the following characters you enter, as well as
    the border of the typing zone, will appear in red. You can delete characters
    with the &ldquo;Backspace&rdquo; key.
  </p>,
  <p>
    If you have some delay and want to delete one character, make sure to press
    the &ldquo;Backspace&rdquo; key until you see the letter disappear on your
    screen.
  </p>,
  <p>
    When deleting several characters, you will have to release the
    &ldquo;Backspace&rdquo; key and press it again for each character you want
    to delete.
  </p>,
  <p>
    In order to finish the task, you need to enter the whole sentence correctly.
  </p>,
  <p>
    Once you have entered the sentence correctly, you will be asked to press
    &ldquo;Enter&rdquo; to continue the experiment and move on to the next task.
  </p>,
  <p>You will first have a tutorial to get to understand the mechanism.</p>,
  <p>
    You will then have 5 practice tasks to get comfortable with it and then the
    real experiment will begin and you will have to complete 20 tasks to
    complete the whole experiment.
  </p>
].map(
  // These will be an array of element provided as children. As a result they
  // need a key.
  (elt, i) => cloneElement(elt, { key: i })
);

const Instructions = ({ onStart }) => {
  const [step, setStep] = useState(1);

  return (
    <div className={styles.main}>
      <h2>Instructions</h2>
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
          Start
        </Button>
      </div>
    </div>
  );
};

Instructions.propTypes = {
  onStart: PropTypes.func.isRequired
};

export default Instructions;
