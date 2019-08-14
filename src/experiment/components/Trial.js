import React from "react";
import PropTypes from "prop-types";
import { totalSuggestions } from "../../utils/constants";
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
  onInlineSuggestion
}) => {
  const {
    dispatch,
    focusTarget,
    suggestions,
    text,
    input,
    keyboardLayoutName,
    isCompleted
  } = useTrial({
    totalSuggestions: onInlineSuggestion ? 1 : totalSuggestions,
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
      onInlineSuggestion={onInlineSuggestion}
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
  targetAccuracy: PropTypes.number.isRequired,
  weightedAccuracy: PropTypes.number.isRequired,
  sdAccuracy: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  onInlineSuggestion: PropTypes.bool.isRequired
};

export default Trial;
