import React, { useCallback } from "react";
import PropTypes from "prop-types";
import {
  SuggestionTypes,
  TutorialSteps,
  Actions,
  FocusTargetTypes,
  Devices,
} from "../../common/constants";
import "react-simple-keyboard/build/css/index.css";
import TrialPresenter from "./TrialPresenter";
import useTrial from "../hooks/useTrial";
import {
  isTargetCompleted,
  isInputCorrect,
  getTextFromSksDistribution,
} from "../input";
import tutorialSksDistributions from "./tutorialSKSDistributions.json";

const getTutorialStep = (
  tutorialSentence,
  input,
  doNotShowDelayInstructions
) => {
  const hasErrors = !isInputCorrect(input, tutorialSentence);

  if (input === "" || input == null) {
    return TutorialSteps.start;
  }
  if ("vi".startsWith(input)) {
    return TutorialSteps.input;
  }
  if (input === "vid") {
    return TutorialSteps.suggestion;
  }
  if (input === "video ") {
    return TutorialSteps.wrongSuggestion;
  }
  if (hasErrors && !input.startsWith("video camera with")) {
    return TutorialSteps.error;
  }
  if ("video camera w".startsWith(input) && !doNotShowDelayInstructions) {
    return TutorialSteps.delay;
  }
  if (input === "video camera wi" && !doNotShowDelayInstructions) {
    return TutorialSteps.delaySuggestion;
  }
  const isCompleted = isTargetCompleted(input, tutorialSentence);
  if (!isCompleted && input.startsWith("video camera with a zoom lens")) {
    return TutorialSteps.finalWhiteSpace;
  }
  if (!isCompleted) {
    return TutorialSteps.finish;
  }
  return TutorialSteps.end;
};

const isActionAllowed = (
  tutorialSentence,
  state,
  action,
  suggestionsType,
  isVirtualKeyboardEnabled,
  doNotShowDelayInstructions
) => {
  if (
    action.type === Actions.windowBlurred ||
    action.type === Actions.windowFocused ||
    action.type === Actions.fullScreenEntered ||
    action.type === Actions.fullScreenLeft
  ) {
    return true;
  }
  switch (
    getTutorialStep(tutorialSentence, state.input, doNotShowDelayInstructions)
  ) {
    case TutorialSteps.start:
    case TutorialSteps.input:
      return (
        action.type === Actions.inputChar &&
        action.char === tutorialSentence[state.input.length]
      );
    case TutorialSteps.suggestion:
      if (
        suggestionsType === SuggestionTypes.inline ||
        isVirtualKeyboardEnabled ||
        (suggestionsType === SuggestionTypes.bar &&
          state.totalSuggestionTargets === 1)
      ) {
        return action.type === Actions.inputSuggestion;
      }
      return (
        action.type === Actions.inputSuggestion && action.word === "video "
      );
    case TutorialSteps.wrongSuggestion:
      if (
        suggestionsType === SuggestionTypes.inline ||
        isVirtualKeyboardEnabled ||
        (suggestionsType === SuggestionTypes.bar &&
          state.totalSuggestionTargets === 1)
      ) {
        return action.type === Actions.inputSuggestion;
      }
      return (
        action.type === Actions.inputSuggestion && action.word === "camping "
      );
    case TutorialSteps.error:
      return action.type === Actions.deleteChar;
    case TutorialSteps.delay:
      return (
        action.type === Actions.inputChar &&
        action.char === tutorialSentence[state.input.length]
      );
    case TutorialSteps.delaySuggestion:
      if (
        suggestionsType === SuggestionTypes.inline ||
        isVirtualKeyboardEnabled ||
        (suggestionsType === SuggestionTypes.bar &&
          state.totalSuggestionTargets === 1)
      ) {
        return action.type === Actions.inputSuggestion;
      }
      return (
        action.type === Actions.moveFocusTarget ||
        (action.type === Actions.inputSuggestion &&
          state.focusTarget.type === FocusTargetTypes.suggestion &&
          state.focusTarget.suggestionNumber === 0)
      );
    case TutorialSteps.finish:
    case TutorialSteps.end:
    case TutorialSteps.finalWhiteSpace:
      return (
        action.type !== Actions.deleteChar ||
        action.changes.input.startsWith("video camera with")
      );
    default:
      return false;
  }
};

const Tutorial = ({
  onAdvanceWorkflow,
  onLog,
  keyStrokeDelay: trialKeyStrokeDelay,
  targetAccuracy,
  id,
  suggestionsType,
  isVirtualKeyboardEnabled,
  totalSuggestions,
  device,
  doNotShowDelayInstructions,
}) => {
  const tutorialSksDistribution =
    tutorialSksDistributions[Math.round(targetAccuracy * 100).toFixed(0)];
  const tutorialSentence = getTextFromSksDistribution(tutorialSksDistribution);

  // We use useCallback to prevent the trial reducer from being called
  // twice. It is expensive.
  const reducer = useCallback(
    (state, action) => {
      const nextState = isActionAllowed(
        tutorialSentence,
        state,
        action,
        suggestionsType,
        isVirtualKeyboardEnabled,
        doNotShowDelayInstructions
      )
        ? action.changes
        : state;

      switch (
        getTutorialStep(
          tutorialSentence,
          nextState.input,
          doNotShowDelayInstructions
        )
      ) {
        case TutorialSteps.start:
        case TutorialSteps.input:
          return { ...nextState, suggestions: [] };
        case TutorialSteps.suggestion:
          return {
            ...nextState,
            suggestions:
              totalSuggestions > 1
                ? ["video ", "vidicon ", "videotapes "]
                : ["video"],
          };
        case TutorialSteps.wrongSuggestion:
          return {
            ...nextState,
            suggestions:
              totalSuggestions > 1
                ? ["campaign ", "camping ", "campuses "]
                : ["camping"],
          };
        case TutorialSteps.error: {
          let stateSuggestions = ["are ", "the ", "of "];
          if (nextState.input.length <= 10) {
            stateSuggestions = ["campus ", "camper ", "camped "];
          } else if (!nextState.input.endsWith(" ")) {
            stateSuggestions = ["camping ", "campaign ", "campuses "];
          }
          return { ...nextState, suggestions: stateSuggestions };
        }
        case TutorialSteps.delay:
          return {
            ...nextState,
            keyStrokeDelay: trialKeyStrokeDelay,
            suggestions: [],
          };
        case TutorialSteps.delaySuggestion:
          return { ...nextState, suggestions: ["with ", "wing ", "wish "] };
        default:
          return nextState;
      }
    },
    [
      suggestionsType,
      isVirtualKeyboardEnabled,
      doNotShowDelayInstructions,
      totalSuggestions,
      trialKeyStrokeDelay,
      tutorialSentence,
    ]
  );

  const {
    dispatch,
    focusTarget,
    suggestions,
    input,
    keyboardLayoutName,
    isCompleted,
    hasErrors,
    text,
    isFullScreen,
  } = useTrial({
    suggestionsType,
    onComplete: onAdvanceWorkflow,
    onLog,
    initKeyStrokeDelay: 0,
    sksDistribution: tutorialSksDistribution,
    totalSuggestions:
      suggestionsType === SuggestionTypes.inline ? 1 : totalSuggestions,
    id,
    targetAccuracy: 0,
    weightedAccuracy: 0,
    sdAccuracy: 0,
    reducer,
  });

  return (
    <TrialPresenter
      dispatch={dispatch}
      focusTarget={focusTarget}
      suggestions={input === "" ? [] : suggestions}
      text={text}
      isFullScreen={isFullScreen}
      input={input}
      keyboardLayoutName={keyboardLayoutName}
      isCompleted={isCompleted}
      suggestionsType={suggestionsType}
      hasErrors={hasErrors}
      tutorialStep={getTutorialStep(
        tutorialSentence,
        input,
        doNotShowDelayInstructions
      )}
      totalSuggestions={totalSuggestions}
      showsHelp={false}
      isVirtualKeyboardEnabled={isVirtualKeyboardEnabled}
      isSystemKeyboardEnabled={!isVirtualKeyboardEnabled}
      device={device}
    />
  );
};

Tutorial.propTypes = {
  targetAccuracy: PropTypes.number.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyStrokeDelay: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired,
  isVirtualKeyboardEnabled: PropTypes.bool.isRequired,
  totalSuggestions: PropTypes.number.isRequired,
  device: PropTypes.oneOf(Object.values(Devices)).isRequired,
  doNotShowDelayInstructions: PropTypes.bool.isRequired,
};

export default Tutorial;
