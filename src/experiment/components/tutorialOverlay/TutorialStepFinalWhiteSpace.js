import React from "react";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import TopOfBarWrapper from "./TopOfBarWrapper";

const TutorialStepFinalWhiteSpace = () => (
  <TopOfBarWrapper>
    <div className={styles.stepFinish}>
      <Info>The last character to type is a white space.</Info>
    </div>
  </TopOfBarWrapper>
);

export default TutorialStepFinalWhiteSpace;
