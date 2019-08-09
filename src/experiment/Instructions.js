import React, { useState } from "react";
import PropTypes from "prop-types";
import Appear from "./Appear";
import styles from "./Instructions.module.css";

const instructionsList = [
  "In this experiment we are simulating a typing task where you have to enter a given text with suggestions to help you out.\n Note that during the trials you can only use your keyboard.",
  'A suggested word will appear behind your input every time you enter a key.\n You can use this suggestion by tapping the "Tab" key on your keyboard and it will complete your current word.\n You will then be able to type again.',
  "You may or may not experience some delay when typing before characters show up on your screen.\n If you have some, make sure to press the key on your keyboard until the character appears on screen.\n Once it has appeared, you can release the key and move on to the next one.",
  'Only the "Tab" key does not have any delay and allow you to use the suggested word quickly.',
  "As you type, the given text to type and the border of the input zone will change color according to whether or not you enter the text without mistake.",
  'If you make any error, all the following characters you enter, as well as the border of the typing zone, will appear in red. You can delete characters with the "Backspace" key.',
  'If you have some delay and want to delete one character, make sure to press the "Backspace" key until you see the letter disappear on your screen.',
  'When deleting several characters, you will have to release the "Backspace" key and press it again for each character you want to delete.',
  "In order to finish the task, you need to enter the whole sentence correctly.",
  'Once you have entered the sentence correctly, you will be asked to press "Enter" to continue the experiment and move on to the next task.',
  "You will first have a tutorial to get comfortable with this mechanism.",
  "Then the real experiment will begin and you will have to complete X tasks to complete the whole experiment."
];

const Instructions = ({ setInstructionPassed }) => {
  const [sentencesToDisplay, setSentencesToDisplay] = useState([]);
  function displayNextSentence() {
    setSentencesToDisplay(
      instructionsList.slice(0, sentencesToDisplay.length + 1)
    );
  }

  return (
    <div className={styles.main}>
      <h2>Experiment instructions</h2>
      <p>
        <strong>
          Please read carefully the following instructions, you will have to
          answer a test after
        </strong>
      </p>
      <div className={styles.sentencesWrapper}>
        <Appear currentStep={sentencesToDisplay.length}>
          {sentencesToDisplay}
        </Appear>
      </div>
      <div className={styles.buttonWrapper}>
        <button
          type="button"
          className={[
            styles.navigationButtons,
            sentencesToDisplay.length === instructionsList.length
              ? styles.unusable
              : styles.usable
          ].join(" ")}
          disabled={sentencesToDisplay.length === instructionsList.length}
          onClick={displayNextSentence}
        >
          Next
        </button>
        <button
          type="button"
          className={[
            styles.navigationButtons,
            sentencesToDisplay.length === instructionsList.length
              ? styles.usable
              : styles.unusable
          ].join(" ")}
          disabled={sentencesToDisplay.length !== instructionsList.length}
          onClick={() => {
            setInstructionPassed(true);
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

Instructions.propTypes = {
  setInstructionPassed: PropTypes.func.isRequired
};

export default Instructions;
