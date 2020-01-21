import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";

const TutorialStepFinish = ({ presenterBottom }) => (
  <div className={styles.stepFinish} style={{ top: presenterBottom }}>
    <Info>That is all. All actions are now enabled.</Info>
    <Instruction>
      Finish the task as fast and accurately as possible.
    </Instruction>
  </div>
);
TutorialStepFinish.propTypes = { presenterBottom: PropTypes.number.isRequired };

export default TutorialStepFinish;
