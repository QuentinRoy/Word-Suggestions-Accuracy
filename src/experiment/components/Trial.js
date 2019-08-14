import React from "react";
import PropTypes from "prop-types";
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
  totalSuggestions
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
    totalSuggestions,
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
  totalSuggestions: PropTypes.number
};

Trial.defaultProps = {
  totalSuggestions: 3
};

export default Trial;
