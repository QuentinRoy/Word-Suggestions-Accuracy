import React from "react";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";
import RectPropType from "./RectPropType";
import TopOfBarWrapper from "./TopOfBarWrapper";

const TutorialStepInput = ({ inputRect }) => (
  <div className={styles.stepInput}>
    <Info
      left={inputRect.left}
      top={inputRect.top}
      width={inputRect.width}
      height={inputRect.height}
    >
      This is where your input will be entered
    </Info>
    <TopOfBarWrapper>
      <Instruction>Now type the two next letters.</Instruction>
    </TopOfBarWrapper>
  </div>
);
TutorialStepInput.propTypes = { inputRect: RectPropType.isRequired };

export default TutorialStepInput;
