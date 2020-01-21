import React, { memo } from "react";
import PropTypes from "prop-types";
import { useTransition, animated } from "react-spring";
import classNames from "classnames";
import { TutorialSteps, SuggestionTypes } from "../../../utils/constants";
import Context from "./TutorialOverlayContext";
import styles from "./styles/TutorialOverlay.module.scss";
import TutorialStepStart from "./TutorialStepStart";
import TutorialStepDelaySuggestion from "./TutorialStepDelaySuggestion";
import TutorialStepError from "./TutorialStepError";
import TutorialStepDelay from "./TutorialStepDelay";
import TutorialStepFinish from "./TutorialStepFinish";
import TutorialStepFinalWhiteSpace from "./TutorialStepFinalWhiteSpace";
import TutorialStepEnd from "./TutorialStepEnd";
import TutorialStepInput from "./TutorialStepInput";
import TutorialStepWrongSuggestion from "./TutorialStepWrongSuggestion";
import TutorialStepSuggestion from "./TutorialStepSuggestion";
import RectPropType from "./RectPropType";

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
    isVirtualKeyboardEnabled,
    totalSuggestions
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

    const content = transitions.map(({ item, key, props }) => {
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
            totalSuggestions={totalSuggestions}
          />
        </animated.div>
      );
    });

    // Use a context provider to avoid passing all this props down the tree,
    // and give more flexibility to modify Instruction (its main consumer)
    // without changing the step elements.
    return (
      <Context.Provider
        value={{
          tutorialStep,
          stimulusTextRect,
          inputRect,
          inlineSuggestionRect,
          suggestionsBarRect,
          suggestionsType,
          virtualKeyboardRect,
          isVirtualKeyboardEnabled,
          totalSuggestions
        }}
      >
        {content}
      </Context.Provider>
    );
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
  isVirtualKeyboardEnabled: PropTypes.bool,
  totalSuggestions: PropTypes.number.isRequired
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
