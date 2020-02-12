import React from "react";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";
import TopOfBarWrapper from "./TopOfBarWrapper";

const TutorialStepFinish = () => (
  <TopOfBarWrapper>
    <div className={styles.stepFinish}>
      <Info>That is all. All actions are now enabled.</Info>
      <Instruction>
        Finish the task as fast and accurately as possible.
      </Instruction>
    </div>
  </TopOfBarWrapper>
);

export default TutorialStepFinish;
