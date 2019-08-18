import React, { memo, useRef } from "react";
import PropTypes from "prop-types";
import { useTransition, animated } from "react-spring";
import { TutorialSteps } from "../../utils/constants";
import styles from "./styles/TutorialOverlay.module.scss";

const RectPropType = PropTypes.shape({
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  bottom: PropTypes.number.isRequired,
  right: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
});

const Instruction = ({ children, inputRect, style }) => (
  <div
    className={styles.instruction}
    style={inputRect != null ? { top: inputRect.bottom, ...style } : style}
  >
    <div className={styles.box}>{children}</div>
  </div>
);

Instruction.propTypes = {
  children: PropTypes.node.isRequired,
  inputRect: RectPropType,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object
};
Instruction.defaultProps = { inputRect: null, style: {} };

const Info = ({ children, top, left, width, height, style }) => (
  <div className={styles.info} style={{ top, left, width, height, ...style }}>
    <div className={styles.box}>{children}</div>
  </div>
);

Info.propTypes = {
  children: PropTypes.node.isRequired,
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object
};
Info.defaultProps = { width: undefined, height: undefined, style: {} };

const Circle = ({ rect, circleXMargin, circleYMargin, strokeWidth }) => {
  const circleWidth = rect.width + circleXMargin * 2;
  const circleHeight = rect.height + circleYMargin * 2;
  const svgWidth = circleWidth + strokeWidth;
  const svgHeight = circleHeight + strokeWidth;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={svgHeight}
      width={svgWidth}
      style={{
        position: "absolute",
        top: rect.top - circleYMargin - strokeWidth / 2,
        left: rect.left - circleXMargin - strokeWidth / 2
      }}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      <ellipse
        className={styles.circle}
        cx="50%"
        cy="50%"
        rx={circleWidth / 2}
        ry={circleHeight / 2}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};
Circle.propTypes = {
  rect: RectPropType.isRequired,
  circleXMargin: PropTypes.number,
  circleYMargin: PropTypes.number,
  strokeWidth: PropTypes.number
};
Circle.defaultProps = {
  circleXMargin: 0,
  circleYMargin: 0,
  strokeWidth: 6
};

const TutorialStepStart = ({ stimulusTextRect, inputRect }) => (
  <div className={styles.stepStart}>
    <Circle rect={stimulusTextRect} circleXMargin={40} circleYMargin={30} />
    <Info
      left={stimulusTextRect.left + stimulusTextRect.width + 40}
      top={stimulusTextRect.top + stimulusTextRect.height}
    >
      This is what you must type.
    </Info>
    <Instruction inputRect={inputRect}>Type the first letter.</Instruction>
  </div>
);

TutorialStepStart.propTypes = {
  stimulusTextRect: RectPropType.isRequired,
  inputRect: RectPropType.isRequired
};

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
    <Instruction inputRect={inputRect}>Type the 2 next letters.</Instruction>
  </div>
);
TutorialStepInput.propTypes = { inputRect: RectPropType.isRequired };

const TutorialStepSuggestion = ({ inputRect, inlineSuggestionRect }) => {
  // Store this in a ref as we don't want it to change once set up the first
  // time.
  const sugRef = useRef(inlineSuggestionRect);
  if (inlineSuggestionRect == null) return null;
  if (sugRef.current == null) {
    sugRef.current = inlineSuggestionRect;
  }
  return (
    <div className={styles.stepSuggestion}>
      <Circle rect={sugRef.current} circleXMargin={10} circleYMargin={10} />
      <Info
        left={sugRef.current.right + 20}
        top={inputRect.top}
        height={inputRect.height}
      >
        Word suggestions will appear as you type.
        <br />
        You can ignore them, or accept them by pressing{" "}
        <span className={styles.key}>tab</span>.
      </Info>
      <Instruction inputRect={inputRect}>Accept the suggestion.</Instruction>
    </div>
  );
};
TutorialStepSuggestion.propTypes = {
  inputRect: RectPropType.isRequired,
  inlineSuggestionRect: RectPropType
};
TutorialStepSuggestion.defaultProps = {
  inlineSuggestionRect: undefined
};

const TutorialStepWrongSuggestion = ({ inputRect }) => (
  <div className={styles.stepWrongSuggestion}>
    <Instruction inputRect={inputRect}>Accept the suggestion.</Instruction>
  </div>
);

TutorialStepWrongSuggestion.propTypes = {
  inputRect: RectPropType.isRequired
};

const TutorialStepError = ({ inputRect }) => (
  <div className={styles.stepError} style={{ top: inputRect.bottom }}>
    <Info>
      Suggestions are not always accurate.
      <br />
      When there are errors in your input, it turns red.
      <br />
    </Info>
    <Instruction>Fix the input</Instruction>
  </div>
);

TutorialStepError.propTypes = {
  inputRect: RectPropType.isRequired
};

const TutorialStepDelay = ({ inputRect }) => (
  <div className={styles.stepDelay} style={{ top: inputRect.bottom }}>
    <Info>
      Your impairment was just enabled.
      <br />
      From now on, you must keep each key down for a short period of time before
      it takes effect. If you release the key too soon, it has no effect.
    </Info>
    <Instruction>Keep typing.</Instruction>
  </div>
);

TutorialStepDelay.propTypes = { inputRect: RectPropType.isRequired };

const TutorialStepDelaySuggestion = ({ inputRect }) => (
  <div className={styles.stepDelaySuggestion} style={{ top: inputRect.bottom }}>
    <Info>Impairment also applies to suggestion.</Info>
    <Instruction>Accept the suggestion.</Instruction>
  </div>
);
TutorialStepDelaySuggestion.propTypes = { inputRect: RectPropType.isRequired };

const TutorialStepFinish = ({ inputRect }) => (
  <div className={styles.stepFinish} style={{ top: inputRect.bottom }}>
    <Info>That is all. All actions are now enabled.</Info>
    <Instruction>
      Finish the task, as fast as you can, while minimizing errors.
    </Instruction>
  </div>
);
TutorialStepFinish.propTypes = { inputRect: RectPropType.isRequired };

const TutorialStepEnd = () => null;

const StepComponents = {
  [TutorialSteps.start]: TutorialStepStart,
  [TutorialSteps.input]: TutorialStepInput,
  [TutorialSteps.suggestion]: TutorialStepSuggestion,
  [TutorialSteps.wrongSuggestion]: TutorialStepWrongSuggestion,
  [TutorialSteps.error]: TutorialStepError,
  [TutorialSteps.delay]: TutorialStepDelay,
  [TutorialSteps.delaySuggestion]: TutorialStepDelaySuggestion,
  [TutorialSteps.finish]: TutorialStepFinish,
  [TutorialSteps.end]: TutorialStepEnd
};

const TutorialOverlay = memo(
  ({ tutorialStep, stimulusTextRect, inputRect, inlineSuggestionRect }) => {
    const transitions = useTransition(tutorialStep, null, {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 }
    });

    if (inputRect == null) return null;

    return transitions.map(({ item, key, props }) => {
      const Component = StepComponents[item];
      return (
        <animated.div key={key} className={styles.main} style={props}>
          <Component
            stimulusTextRect={stimulusTextRect}
            inputRect={inputRect}
            inlineSuggestionRect={inlineSuggestionRect}
          />
        </animated.div>
      );
    });
  }
);

TutorialOverlay.propTypes = {
  tutorialStep: PropTypes.oneOf(Object.values(TutorialSteps)),
  stimulusTextRect: RectPropType,
  inputRect: RectPropType,
  inlineSuggestionRect: RectPropType
};

TutorialOverlay.defaultProps = {
  tutorialStep: null,
  stimulusTextRect: null,
  inputRect: null,
  inlineSuggestionRect: null
};

export default TutorialOverlay;
