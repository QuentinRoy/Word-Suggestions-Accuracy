import React, { memo, useRef } from "react";
import PropTypes from "prop-types";
import { useTransition, animated } from "react-spring";
import classNames from "classnames";
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

const Instruction = ({ children, presenterBottom, style }) => (
  <div
    style={{ top: presenterBottom, ...style }}
    className={styles.instruction}
  >
    <div className={styles.box}>{children}</div>
  </div>
);

Instruction.propTypes = {
  children: PropTypes.node.isRequired,
  presenterBottom: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object
};
Instruction.defaultProps = { presenterBottom: undefined, style: {} };

const Info = ({ children, top, left, width, height, style }) => (
  <div className={styles.info} style={{ top, left, width, height, ...style }}>
    <div className={styles.box}>{children}</div>
  </div>
);

Info.propTypes = {
  children: PropTypes.node.isRequired,
  top: PropTypes.number,
  left: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object
};
Info.defaultProps = {
  top: undefined,
  left: undefined,
  width: undefined,
  height: undefined,
  style: {}
};

const CircleTypes = {
  circle: "circle",
  rectangle: "rectangle"
};

const Circle = ({
  rect,
  circleXMargin,
  circleYMargin,
  strokeWidth,
  type,
  rectRadius
}) => {
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
      {type === CircleTypes.circle ? (
        <ellipse
          className={styles.circle}
          cx="50%"
          cy="50%"
          rx={circleWidth / 2}
          ry={circleHeight / 2}
          strokeWidth={strokeWidth}
        />
      ) : (
        <rect
          className={styles.circle}
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={circleWidth}
          height={circleHeight}
          rx={rectRadius}
          strokeWidth={strokeWidth}
        />
      )}
    </svg>
  );
};
Circle.propTypes = {
  type: PropTypes.oneOf(Object.values(CircleTypes)),
  rect: RectPropType.isRequired,
  circleXMargin: PropTypes.number,
  circleYMargin: PropTypes.number,
  strokeWidth: PropTypes.number,
  rectRadius: PropTypes.number
};
Circle.defaultProps = {
  type: CircleTypes.circle,
  circleXMargin: 0,
  circleYMargin: 0,
  strokeWidth: 6,
  rectRadius: 20
};

const TutorialStepStart = ({ stimulusTextRect, presenterBottom }) => (
  <div className={styles.stepStart}>
    <Circle rect={stimulusTextRect} circleXMargin={40} circleYMargin={30} />
    <Info
      left={stimulusTextRect.left + stimulusTextRect.width + 40}
      top={stimulusTextRect.top + stimulusTextRect.height}
    >
      This is what you must type. It ends with a white space.
    </Info>
    <Instruction presenterBottom={presenterBottom}>
      Type the first letter.
    </Instruction>
  </div>
);

TutorialStepStart.propTypes = {
  stimulusTextRect: RectPropType.isRequired,
  presenterBottom: PropTypes.number.isRequired
};

const TutorialStepInput = ({ inputRect, presenterBottom }) => (
  <div className={styles.stepInput}>
    <Info
      left={inputRect.left}
      top={inputRect.top}
      width={inputRect.width}
      height={inputRect.height}
    >
      This is where your input will be entered
    </Info>
    <Instruction presenterBottom={presenterBottom}>
      Now type the two next letters.
    </Instruction>
  </div>
);
TutorialStepInput.propTypes = {
  presenterBottom: PropTypes.number.isRequired,
  inputRect: RectPropType.isRequired
};

const TutorialStepSuggestion = ({
  inputRect,
  inlineSuggestionRect,
  suggestionsBarRect,
  presenterBottom,
  suggestionsType,
  isVirtualKeyboardEnabled
}) => {
  // Store this in a ref as we don't want it to change once set up the first
  // time.
  const suggestionRef = useRef(inlineSuggestionRect);
  if (suggestionRef.current == null) {
    suggestionRef.current =
      inlineSuggestionRect == null ? suggestionsBarRect : inlineSuggestionRect;
  }
  if (suggestionsType === SuggestionTypes.inline) {
    if (inlineSuggestionRect == null) return null;
    return (
      <div className={styles.stepSuggestion}>
        <Circle
          rect={suggestionRef.current}
          circleXMargin={10}
          circleYMargin={10}
        />
        <Info
          left={suggestionRef.current.right + 20}
          top={inputRect.top}
          height={inputRect.height}
        >
          Word suggestions will appear as you type.
          <br />
          You can ignore them, or accept them by pressing the key{" "}
          <span className={styles.noWrap}>
            <span className={styles.key}>tab</span> /{" "}
            <span className={styles.key}>&#8677;</span>
          </span>{" "}
          at the left of your keyboard.
        </Info>
        <Instruction presenterBottom={presenterBottom}>
          Accept the suggestion.
        </Instruction>
      </div>
    );
  }
  return (
    <div className={styles.stepSuggestion}>
      <Circle
        rect={suggestionRef.current}
        circleXMargin={15}
        circleYMargin={15}
        rectRadius={30}
        type={CircleTypes.rectangle}
      />
      <div className={styles.messagesWrapper} style={{ top: presenterBottom }}>
        <Info>
          {isVirtualKeyboardEnabled ? (
            <div>
              Word suggestions will be shown and updated as you type.
              <br />
              You can ignore them, or select them by pressing on the word.
            </div>
          ) : (
            <div>
              Word suggestions will appear as you type.
              <br />
              You can ignore them, or accept them by pressing the key{" "}
              <span className={styles.noWrap}>
                <span className={styles.key}>tab</span> /{" "}
                <span className={styles.key}>&#8677;</span>
              </span>{" "}
              at the left of your keyboard.
            </div>
          )}
        </Info>
        <Instruction>Select the first suggestion.</Instruction>
      </div>
    </div>
  );
};
TutorialStepSuggestion.propTypes = {
  inputRect: RectPropType.isRequired,
  presenterBottom: PropTypes.number.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired,
  inlineSuggestionRect: RectPropType,
  suggestionsBarRect: RectPropType,
  isVirtualKeyboardEnabled: PropTypes.bool
};
TutorialStepSuggestion.defaultProps = {
  inlineSuggestionRect: undefined,
  suggestionsBarRect: undefined,
  isVirtualKeyboardEnabled: false
};

const TutorialStepWrongSuggestion = ({ presenterBottom, suggestionsType }) => (
  <div className={styles.stepWrongSuggestion}>
    <Instruction presenterBottom={presenterBottom}>
      Now{" "}
      {suggestionsType === SuggestionTypes.bar
        ? "select the first "
        : "accept the "}
      suggestion again.
    </Instruction>
  </div>
);
TutorialStepWrongSuggestion.propTypes = {
  presenterBottom: PropTypes.number.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepError = ({ presenterBottom, isVirtualKeyboardEnabled }) => (
  <div style={{ top: presenterBottom }} className={styles.stepError}>
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
          <span className={styles.key}>backspace</span>
          {" / "}
          <span className={styles.key}>delete</span>
          {" / "}
          <span className={styles.key}>&#9003;</span>
        </>
      )}{" "}
      key.
      {isVirtualKeyboardEnabled ? "Arrow keys are disabled." : null}
    </Info>
    <Instruction>Fix the input</Instruction>
  </div>
);
TutorialStepError.propTypes = {
  presenterBottom: PropTypes.number.isRequired,
  isVirtualKeyboardEnabled: PropTypes.bool
};

TutorialStepError.defaultProps = {
  isVirtualKeyboardEnabled: false
};

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

const TutorialStepDelaySuggestion = ({ presenterBottom, suggestionsType }) => (
  <div className={styles.stepDelaySuggestion} style={{ top: presenterBottom }}>
    <Info>Impairment also applies to suggestion.</Info>
    <Instruction>
      Now accept the{suggestionsType === SuggestionTypes.bar ? " first " : " "}
      suggestion.
    </Instruction>
  </div>
);
TutorialStepDelaySuggestion.propTypes = {
  presenterBottom: PropTypes.number.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

const TutorialStepFinish = ({ presenterBottom }) => (
  <div className={styles.stepFinish} style={{ top: presenterBottom }}>
    <Info>That is all. All actions are now enabled.</Info>
    <Instruction>
      Finish the task as fast and accurately as possible.
    </Instruction>
  </div>
);
TutorialStepFinish.propTypes = { presenterBottom: PropTypes.number.isRequired };

const TutorialStepFinalWhiteSpace = ({ presenterBottom }) => (
  <div className={styles.stepFinish} style={{ top: presenterBottom }}>
    <Info>The last character to type is a white space.</Info>
  </div>
);
TutorialStepFinalWhiteSpace.propTypes = {
  presenterBottom: PropTypes.number.isRequired
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
  [TutorialSteps.finalWhiteSpace]: TutorialStepFinalWhiteSpace,
  [TutorialSteps.end]: TutorialStepEnd
};

const TutorialOverlay = memo(
  ({
    tutorialStep,
    stimulusTextRect,
    inputRect,
    inlineSuggestionRect,
    suggestionsBarRect,
    suggestionsType,
    virtualKeyboardRect,
    isVirtualKeyboardEnabled
  }) => {
    const transitions = useTransition(tutorialStep, null, {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 }
    });

    if (inputRect == null) return null;
    let rect;
    if (virtualKeyboardRect !== null) {
      rect = virtualKeyboardRect;
    } else if (suggestionsType === SuggestionTypes.inline) {
      rect = inputRect;
    } else {
      rect = suggestionsBarRect;
    }
    const { bottom: presenterBottom } = rect;

    return transitions.map(({ item, key, props }) => {
      const Component = StepComponents[item];
      return (
        <animated.div
          key={key}
          className={classNames(styles.overlay, {
            [styles.inlineSuggestionOverlay]:
              suggestionsType === SuggestionTypes.inline,
            [styles.barSuggestionOverlay]:
              suggestionsType === SuggestionTypes.bar
          })}
          style={props}
        >
          <Component
            stimulusTextRect={stimulusTextRect}
            inputRect={inputRect}
            suggestionsBarRect={suggestionsBarRect}
            inlineSuggestionRect={inlineSuggestionRect}
            suggestionsType={suggestionsType}
            presenterBottom={presenterBottom}
            isVirtualKeyboardEnabled={isVirtualKeyboardEnabled}
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
  inlineSuggestionRect: RectPropType,
  suggestionsBarRect: RectPropType,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired,
  virtualKeyboardRect: RectPropType,
  isVirtualKeyboardEnabled: PropTypes.bool
};

TutorialOverlay.defaultProps = {
  tutorialStep: null,
  stimulusTextRect: null,
  inputRect: null,
  inlineSuggestionRect: null,
  suggestionsBarRect: null,
  virtualKeyboardRect: null,
  isVirtualKeyboardEnabled: false
};

export default TutorialOverlay;
