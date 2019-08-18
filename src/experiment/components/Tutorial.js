import React from "react";
import PropTypes from "prop-types";
import { SuggestionTypes, TutorialSteps, Actions } from "../../utils/constants";
import "react-simple-keyboard/build/css/index.css";
import TrialPresenter from "./TrialPresenter";
import useTrial from "../hooks/useTrial";
import { trimEnd } from "../../utils/strings";

const tutorialSentence = "video camera with a zoom lens";

const getTutorialStep = input => {
  // FIXME: this comes from useTrial
  const isCompleted = tutorialSentence === trimEnd(input);
  const hasErrors = !isCompleted && !tutorialSentence.startsWith(input);

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
  if ("video camera w".startsWith(input)) {
    return TutorialSteps.delay;
  }
  if (input === "video camera wi") {
    return TutorialSteps.delaySuggestion;
  }
  if (!isCompleted) {
    return TutorialSteps.finish;
  }
  return TutorialSteps.end;
};

const isActionAllowed = (state, action) => {
  switch (getTutorialStep(state.input)) {
    case TutorialSteps.start:
    case TutorialSteps.input:
      return (
        action.type === Actions.inputChar &&
        action.char === tutorialSentence[state.input.length]
      );
    case TutorialSteps.suggestion:
    case TutorialSteps.wrongSuggestion:
      return action.type === Actions.inputSuggestion;
    case TutorialSteps.error:
      return action.type === Actions.deleteChar;
    case TutorialSteps.delay:
      return action.type === Actions.inputChar;
    case TutorialSteps.delaySuggestion:
      return action.type === Actions.inputSuggestion;
    case TutorialSteps.finish:
    case TutorialSteps.end:
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
  id,
  suggestionsType
}) => {
  const {
    dispatch,
    focusTarget,
    suggestions,
    input,
    keyboardLayoutName,
    isCompleted,
    hasErrors
  } = useTrial({
    suggestionsType,
    onComplete: onAdvanceWorkflow,
    onLog,
    initKeyStrokeDelay: 0,
    sksDistribution: [
      { word: "video", sks: 0 },
      { word: "camera", sks: 0 },
      { word: "with", sks: 0 },
      { word: "a", sks: 0 },
      { word: "zoom", sks: 3 },
      { word: "lens", sks: 1 }
    ],
    id,
    targetAccuracy: 0,
    weightedAccuracy: 0,
    sdAccuracy: 0,
    reducer: (state, action) => {
      const nextState = isActionAllowed(state, action) ? action.changes : state;

      switch (getTutorialStep(nextState.input)) {
        case TutorialSteps.start:
        case TutorialSteps.input:
          return { ...nextState, suggestions: [] };
        case TutorialSteps.suggestion:
          return { ...nextState, suggestions: ["video"] };
        case TutorialSteps.wrongSuggestion:
          return { ...nextState, suggestions: ["camping"] };
        case TutorialSteps.error: {
          let stateSuggestions = ["are"];
          if (nextState.input.length <= 10) {
            stateSuggestions = ["campus"];
          } else if (!nextState.input.endsWith(" ")) {
            stateSuggestions = ["camping"];
          }
          return { ...nextState, suggestions: stateSuggestions };
        }
        case TutorialSteps.delay:
          return {
            ...nextState,
            suggestions: [],
            keyStrokeDelay: trialKeyStrokeDelay
          };
        case TutorialSteps.delaySuggestion:
          return { ...nextState, suggestions: ["with"] };
        default:
          return nextState;
      }
    }
  });

  return (
    <TrialPresenter
      dispatch={dispatch}
      focusTarget={focusTarget}
      suggestions={input === "" ? [] : suggestions}
      text={tutorialSentence}
      input={input}
      keyboardLayoutName={keyboardLayoutName}
      isCompleted={isCompleted}
      suggestionsType={suggestionsType}
      hasErrors={hasErrors}
      tutorialStep={getTutorialStep(input)}
      totalSuggestions={suggestions.length}
    />
  );
};

Tutorial.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyStrokeDelay: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

export default Tutorial;
