import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";

const TutorialStepDelay = ({ presenterBottom }) => (
  <div className={styles.stepDelay} style={{ top: presenterBottom }}>
    <Info>
      Your impairment was just enabled.
      <br />
      You may have to hold the key pressed for a short period for it to take
      effect. If you release the key too soon, it will have no effect.
      <br />
      Your impairment will always be the same.
    </Info>
    <Instruction>Keep typing.</Instruction>
  </div>
);

TutorialStepDelay.propTypes = { presenterBottom: PropTypes.number.isRequired };

export default TutorialStepDelay;
