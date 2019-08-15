import React from "react";
import PropTypes from "prop-types";
import { TutorialSteps } from "../../utils/constants";
import styles from "./styles/TutorialStepsUI.module.css";

const TutorialStepsUI = ({ tutorialStep }) => {
  if (tutorialStep === TutorialSteps.input) {
    return (
      <div>
        <svg viewBox="0 0 100 100" className={styles.arrow}>
          <image
            xlinkHref="./tutorialArrow.svg"
            x="0"
            y="0"
            width="100%"
            height="100%"
          />
        </svg>
        <div className={styles.step}>
          <p>This is where the text will be entered.</p>
          <p>Type the 3 first letters.</p>
        </div>
      </div>
    );
  }
  if (tutorialStep === TutorialSteps.suggestion) {
    return (
      <div className={styles.step}>
        <p>You can see a suggestion appearing behind your input.</p>
        <p>Use it by pressing the `Tab` key.</p>
      </div>
    );
  }
  if (tutorialStep === TutorialSteps.wrongSuggestion) {
    return (
      <div className={styles.step}>
        <p>You can see another suggestion appearing behind your input.</p>
        <p>Use it by pressing the `Tab` key.</p>
      </div>
    );
  }
  if (tutorialStep === TutorialSteps.error) {
    return (
      <div className={styles.step}>
        <p>The input does not correpond to the text.</p>
        <p>
          You can see that you have made a mistake when the input zone turns
          red.
        </p>
        <p>
          To correct it, use the Backspace key until you do not have any mistake
          anymore.
        </p>
        <p>
          Once the mistakes will be deleted, the input zone will turn back to
          blue.
        </p>
      </div>
    );
  }
  if (tutorialStep === TutorialSteps.delay) {
    return (
      <div className={styles.step}>
        <p>In the real experiment, you may experience some delay.</p>
        <p>
          If you have some, you will have to press the key until it shows up in
          the input zone.
        </p>
        <p>
          Enter the next word by pressing each letter until they are entered in
          the input zone.
        </p>
      </div>
    );
  }
  if (tutorialStep === TutorialSteps.delaySuggestion) {
    return (
      <div className={styles.step}>
        <p>This delay also applies to the suggestions.</p>
        <p>
          To select a suggestion while having delay, you have to press the Tab
          key until the suggestion word is entered in the input zone.
        </p>
        <p>Use the next suggestion by pressing the Tab key long enough.</p>
      </div>
    );
  }
  if (tutorialStep === TutorialSteps.end) {
    return (
      <div className={styles.step}>
        <p>You know everything about this experiment.</p>
        <p>Now, finish the sentence.</p>
      </div>
    );
  }
  return null;
};

TutorialStepsUI.propTypes = {
  tutorialStep: PropTypes.oneOf(Object.values(TutorialSteps)).isRequired
};

export default TutorialStepsUI;
