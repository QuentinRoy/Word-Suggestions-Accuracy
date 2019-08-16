import React from "react";
import PropTypes from "prop-types";
import { SuggestionTypes, TutorialSteps, Actions } from "../../utils/constants";
import "react-simple-keyboard/build/css/index.css";
import TrialPresenter from "./TrialPresenter";
import useTrial from "../hooks/useTrial";
import { totalMatchedCharsFromStart } from "../../utils/strings";

const tutorialSentence = "video camera with a zoom lens";

const getTutorialStep = ({ input }) => {
  if (input === undefined) return TutorialSteps.start;
  const isCorrect =
    totalMatchedCharsFromStart(tutorialSentence, input) === input.length;

  if (input.length >= 1 && input.length <= 2) {
    return TutorialSteps.input;
  }
  if (input.length > 2 && input.length < 6 && isCorrect) {
    return TutorialSteps.suggestion;
  }
  if (input.length === 6) {
    return TutorialSteps.wrongSuggestion;
  }
  if (input.length > 9 && input.length < 20 && !isCorrect) {
    return TutorialSteps.error;
  }
  if (input.length >= 9 && input.length < 20) {
    return TutorialSteps.delay;
  }
  if (input.length >= 20 && input.length < 25 && isCorrect) {
    return TutorialSteps.delaySuggestion;
  }
  if (input.length >= 25) {
    return TutorialSteps.end;
  }
  return TutorialSteps.start;
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
      { word: "zoom", sks: 0 },
      { word: "lens", sks: 0 }
    ],
    id,
    targetAccuracy: 0,
    weightedAccuracy: 0,
    sdAccuracy: 0,
    reducer: (state, action) => {
      switch (getTutorialStep(state)) {
        case TutorialSteps.start:
          if (
            action.type === Actions.inputChar &&
            action.char === tutorialSentence[state.input.length]
          ) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          return state;
        case TutorialSteps.input:
          if (
            action.type === Actions.inputChar &&
            action.char === tutorialSentence[state.input.length]
          ) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          return state;
        case TutorialSteps.suggestion:
          if (action.type === Actions.inputSuggestion) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("camping")
            };
          }
          return {
            ...state,
            suggestions: Array(state.suggestions.length).fill("video")
          };
        case TutorialSteps.wrongSuggestion:
          if (action.type === Actions.inputSuggestion) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          return state;
        case TutorialSteps.error:
          if (action.type === Actions.deleteChar) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          return state;
        case TutorialSteps.delay:
          if (action.type === Actions.inputChar) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          return { ...state, keyStrokeDelay: trialKeyStrokeDelay };
        case TutorialSteps.delaySuggestion:
          if (action.type === Actions.inputSuggestion) {
            return action.changes;
          }
          return {
            ...state,
            suggestions: Array(state.suggestions.length).fill("zoom")
          };
        case TutorialSteps.end:
          return action.changes;
        default:
          return state;
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
      tutorialStep={getTutorialStep({ input })}
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
