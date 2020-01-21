import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";
import TopOfBarWrapper from "./TopOfBarWrapper";

const TutorialStepError = ({ isVirtualKeyboardEnabled }) => (
  <TopOfBarWrapper>
    <div className={styles.stepError}>
      <Info>
        Suggestions are not always accurate.
        <br />
        When there are errors in your input, it turns red.
        <br />
        You can fix it with the{" "}
        {isVirtualKeyboardEnabled ? (
          <span className={styles.key}>&#9003;</span>
        ) : (
          <>
            <span className={styles.key}>backspace</span> /{" "}
            <span className={styles.key}>delete</span> /{" "}
            <span className={styles.key}>&#9003;</span>
          </>
        )}{" "}
        key.
        {isVirtualKeyboardEnabled ? "Arrow keys are disabled." : null}
      </Info>
      <Instruction>Fix the input</Instruction>
    </div>
  </TopOfBarWrapper>
);
TutorialStepError.propTypes = {
  isVirtualKeyboardEnabled: PropTypes.bool
};

TutorialStepError.defaultProps = {
  isVirtualKeyboardEnabled: false
};

export default TutorialStepError;
