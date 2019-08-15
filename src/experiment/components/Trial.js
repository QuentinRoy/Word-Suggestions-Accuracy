import React from "react";
import PropTypes from "prop-types";
import { SuggestionTypes } from "../../utils/constants";
import "react-simple-keyboard/build/css/index.css";
import TrialPresenter from "./TrialPresenter";
import useTrial from "../hooks/useTrial";

const Trial = ({
  onAdvanceWorkflow,
  onLog,
  keyStrokeDelay,
  sksDistribution,
  id,
  targetAccuracy,
  weightedAccuracy,
  sdAccuracy,
  suggestionsType,
  totalSuggestions
}) => {
  const {
    dispatch,
    focusTarget,
    suggestions,
    text,
    input,
    keyboardLayoutName,
    isCompleted,
    hasErrors
  } = useTrial({
    totalSuggestions,
    suggestionsType,
    onComplete: onAdvanceWorkflow,
    onLog,
    keyStrokeDelay,
    sksDistribution,
    id,
    targetAccuracy,
    weightedAccuracy,
    sdAccuracy
  });

  return (
    <TrialPresenter
      dispatch={dispatch}
      focusTarget={focusTarget}
      suggestions={suggestions}
      text={text}
      input={input}
      keyboardLayoutName={keyboardLayoutName}
      isCompleted={isCompleted}
      totalSuggestions={totalSuggestions}
      suggestionsType={suggestionsType}
      hasErrors={hasErrors}
    />
  );
};

Trial.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyStrokeDelay: PropTypes.number.isRequired,
  sksDistribution: PropTypes.arrayOf(
    PropTypes.shape({
      word: PropTypes.string.isRequired,
      sks: PropTypes.number.isRequired
    })
  ).isRequired,
  totalSuggestions: PropTypes.number.isRequired,
  targetAccuracy: PropTypes.number.isRequired,
  weightedAccuracy: PropTypes.number.isRequired,
  sdAccuracy: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired
};

export default Trial;
