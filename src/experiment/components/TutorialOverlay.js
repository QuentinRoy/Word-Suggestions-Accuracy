import React, { memo, useRef } from "react";
import PropTypes from "prop-types";
import { useTransition, animated } from "react-spring";
import { TutorialSteps, SuggestionTypes } from "../../utils/constants";
import styles from "./styles/TutorialOverlay.module.scss";

const RectPropType = PropTypes.shape({
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  bottom: PropTypes.number.isRequired,
  right: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
});

const Instruction = ({ children, inputRect, style, suggestionsType }) => (
  <div
    className={`${styles.instruction} ${
      suggestionsType === SuggestionTypes.bar ? styles.suggestionBar : null
    }`}
    style={inputRect != null ? { top: inputRect.bottom, ...style } : style}
  >
    <div className={styles.box}>{children}</div>
  </div>
);

Instruction.propTypes = {
  children: PropTypes.node.isRequired,
  inputRect: RectPropType,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
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

const TutorialStepStart = ({
  stimulusTextRect,
  inputRect,
  suggestionsType
}) => (
  <div className={styles.stepStart}>
    <Circle rect={stimulusTextRect} circleXMargin={40} circleYMargin={30} />
    <Info
      left={stimulusTextRect.left + stimulusTextRect.width + 40}
      top={stimulusTextRect.top + stimulusTextRect.height}
    >
      This is what you must type.
    </Info>
    <Instruction inputRect={inputRect} suggestionsType={suggestionsType}>
      Type the first letter.
    </Instruction>
  </div>
);

TutorialStepStart.propTypes = {
  stimulusTextRect: RectPropType.isRequired,
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepInput = ({ inputRect, suggestionsType }) => (
  <div className={styles.stepInput}>
    <Info
      left={inputRect.left}
      top={inputRect.top}
      width={inputRect.width}
      height={inputRect.height}
    >
      This is where your input will be entered
    </Info>
    <Instruction inputRect={inputRect} suggestionsType={suggestionsType}>
      Type the 2 next letters.
    </Instruction>
  </div>
);
TutorialStepInput.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepSuggestion = ({
  inputRect,
  suggestionRect,
  suggestionsType
}) => {
  // Store this in a ref as we don't want it to change once set up the first
  // time.
  const sugRef = useRef(suggestionRect);
  if (suggestionRect == null) return null;
  if (sugRef.current == null) {
    sugRef.current = suggestionRect;
  }
  if (suggestionsType === SuggestionTypes.inline) {
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
          You can ignore them, or accept them by pressing the key{" "}
          <span className={styles.key}>tab</span> /{" "}
          <span className={styles.key}>&#8677;</span> at the left of your
          keyboard.
        </Info>
        <Instruction inputRect={inputRect} suggestionsType={suggestionsType}>
          Accept the suggestion.
        </Instruction>
      </div>
    );
  }
  return (
    <div className={styles.stepSuggestion}>
      <Circle rect={sugRef.current} circleXMargin={10} circleYMargin={10} />
      <Info
        left={sugRef.current.left - 15}
        top={sugRef.current.bottom + 20}
        height={inputRect.height}
      >
        Word suggestions will change as you type.
        <br />
        You can ignore them, or navigate through them by pressing the key{" "}
        <span className={styles.key}>tab</span> /{" "}
        <span className={styles.key}>&#8677;</span> at the left of your keyboard
        and press the key <span className={styles.key}>Enter</span> to accept
        the focused one.
      </Info>
      <Instruction
        style={{ top: inputRect.bottom + 150 }}
        suggestionsType={suggestionsType}
      >
        Accept the first suggestion.
      </Instruction>
    </div>
  );
};
TutorialStepSuggestion.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionRect: RectPropType,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};
TutorialStepSuggestion.defaultProps = {
  suggestionRect: undefined
};

const TutorialStepWrongSuggestion = ({ inputRect, suggestionsType }) => (
  <div className={styles.stepWrongSuggestion}>
    <Instruction inputRect={inputRect} suggestionsType={suggestionsType}>
      Accept the{suggestionsType === SuggestionTypes.bar ? " first " : " "}
      suggestion.
    </Instruction>
  </div>
);

TutorialStepWrongSuggestion.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepError = ({ inputRect, suggestionsType }) => (
  <div
    className={`${styles.stepError} ${
      suggestionsType === SuggestionTypes.bar ? styles.suggestionBar : null
    }`}
    style={{ top: inputRect.bottom }}
  >
    <Info>
      Suggestions are not always accurate.
      <br />
      When there are errors in your input, it turns red.
      <br />
      You can fix it with the <span className={styles.key}>delete</span> key.
      Arrow keys are disabled.
    </Info>
    <Instruction suggestionsType={suggestionsType}>Fix the input</Instruction>
  </div>
);

TutorialStepError.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepDelay = ({ inputRect, suggestionsType }) => (
  <div
    className={`${styles.stepDelay} ${
      suggestionsType === SuggestionTypes.bar ? styles.suggestionBar : null
    }`}
    style={{ top: inputRect.bottom }}
  >
    <Info>
      Your impairment was just enabled.
      <br />
      Hold a key pressed for a short period for it to take effect. If you
      release the key too soon, it has no effect.
      <br />
      Your impairment will always be the same.
    </Info>
    <Instruction suggestionsType={suggestionsType}>Keep typing.</Instruction>
  </div>
);

TutorialStepDelay.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepDelaySuggestion = ({ inputRect, suggestionsType }) => (
  <div
    className={`${styles.stepDelaySuggestion} ${
      suggestionsType === SuggestionTypes.bar ? styles.suggestionBar : null
    }`}
    style={{ top: inputRect.bottom }}
  >
    <Info>Impairment also applies to suggestion.</Info>
    <Instruction suggestionsType={suggestionsType}>
      Accept the{suggestionsType === SuggestionTypes.bar ? " first " : " "}
      suggestion.
    </Instruction>
  </div>
);
TutorialStepDelaySuggestion.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepFinish = ({ inputRect, suggestionsType }) => (
  <div
    className={`${styles.stepFinish} ${
      suggestionsType === SuggestionTypes.bar ? styles.suggestionBar : null
    }`}
    style={{ top: inputRect.bottom }}
  >
    <Info>That is all. All actions are now enabled.</Info>
    <Instruction suggestionsType={suggestionsType}>
      Finish the task, as fast as you can, while minimizing errors.
    </Instruction>
  </div>
);
TutorialStepFinish.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

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
  ({
    tutorialStep,
    stimulusTextRect,
    inputRect,
    suggestionRect,
    suggestionsType
  }) => {
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
            suggestionRect={suggestionRect}
            suggestionsType={suggestionsType}
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
  suggestionRect: RectPropType,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

TutorialOverlay.defaultProps = {
  tutorialStep: null,
  stimulusTextRect: null,
  inputRect: null,
  suggestionRect: null
};

export default TutorialOverlay;
