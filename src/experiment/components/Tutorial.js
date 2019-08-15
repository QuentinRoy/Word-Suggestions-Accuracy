import React from "react";
import PropTypes from "prop-types";
import { SuggestionTypes, TutorialSteps, Actions } from "../../utils/constants";
import "react-simple-keyboard/build/css/index.css";
import TrialPresenter from "./TrialPresenter";
import useTrial from "../hooks/useTrial";
import { totalMatchedCharsFromStart } from "../../utils/strings";

const tutorialSentence = "video camera with a zoom lens";

const getTutorialStep = ({ input }) => {
  if (input === undefined) return TutorialSteps.input;
  const isCorrect =
    totalMatchedCharsFromStart(tutorialSentence, input) === input.length;

  if (input.length <= 2) {
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
  return TutorialSteps.input;
};

const Tutorial = ({
  onAdvanceWorkflow,
  onLog,
  keyStrokeDelay,
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
    keyStrokeDelay,
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
        case TutorialSteps.input:
          // no delay
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
          // no delay
          if (action.type === Actions.inputSuggestion) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("camping")
            };
          }
          return {
            ...action.changes,
            suggestions: Array(state.suggestions.length).fill("video"),
            input: state.input
          };
        case TutorialSteps.wrongSuggestion:
          // no delay
          if (action.type === Actions.inputSuggestion) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          return {
            ...action.changes,
            suggestions: Array(state.suggestions.length).fill("camping"),
            input: state.input
          };
        case TutorialSteps.error:
          // no delay
          if (action.type === Actions.deleteChar) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          return state;
        case TutorialSteps.delay:
          // delay on
          if (action.type === Actions.inputChar) {
            return {
              ...action.changes,
              suggestions: Array(state.suggestions.length).fill("")
            };
          }
          if (action.type === Actions.deleteChar) {
            return state;
          }
          return {
            ...action.changes,
            suggestions: Array(state.suggestions.length).fill("")
          };
        case TutorialSteps.delaySuggestion:
          // delay on
          if (action.type === Actions.inputSuggestion) {
            return { ...action.changes };
          }
          return {
            ...action.changes,
            suggestions: Array(state.suggestions.length).fill("zoom"),
            input: state.input
          };
        case TutorialSteps.end:
          // delay on
          return {
            ...action.changes
          };
        default:
          return state;
      }
    }
  });

  return (
    <TrialPresenter
      dispatch={dispatch}
      focusTarget={focusTarget}
      suggestions={suggestions}
      text={tutorialSentence}
      input={input}
      keyboardLayoutName={keyboardLayoutName}
      isCompleted={isCompleted}
      suggestionsType={suggestionsType}
      hasErrors={hasErrors}
      tutorialStep={getTutorialStep({ input })}
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
