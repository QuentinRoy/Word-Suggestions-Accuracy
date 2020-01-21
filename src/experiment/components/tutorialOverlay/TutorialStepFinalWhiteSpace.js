import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";

const TutorialStepFinalWhiteSpace = ({ presenterBottom }) => (
  <div className={styles.stepFinish} style={{ top: presenterBottom }}>
    <Info>The last character to type is a white space.</Info>
  </div>
);
TutorialStepFinalWhiteSpace.propTypes = {
  presenterBottom: PropTypes.number.isRequired
};

export default TutorialStepFinalWhiteSpace;
