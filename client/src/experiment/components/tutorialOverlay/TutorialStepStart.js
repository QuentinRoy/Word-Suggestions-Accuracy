import React from "react";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";
import Circle from "./Circle";
import RectPropType from "./RectPropType";
import TopOfBarWrapper from "./TopOfBarWrapper";

const TutorialStepStart = ({ stimulusTextRect }) => (
  <div className={styles.stepStart}>
    <Circle rect={stimulusTextRect} circleXMargin={40} circleYMargin={30} />
    <Info
      left={stimulusTextRect.left + stimulusTextRect.width + 40}
      top={stimulusTextRect.top + stimulusTextRect.height}
    >
      This is what you must type. It ends with a white space.
    </Info>
    <TopOfBarWrapper>
      <Instruction>Type the first letter.</Instruction>
    </TopOfBarWrapper>
  </div>
);

TutorialStepStart.propTypes = { stimulusTextRect: RectPropType.isRequired };

export default TutorialStepStart;
