import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Trial from "./Trial";
import getWordAccuracies from "../utils/getWordAccuracies";

function TypingTask(props) {
  const {
    text,
    onAdvanceWorkflow,
    onLog,
    keyboardLayout,
    accuracy,
    id,
    taskDelay,
    participant,
    trialData
  } = props;

  const trialStartTime = new Date();
  const configData = [
    participant,
    text,
    taskDelay,
    accuracy,
    trialStartTime,
    trialData.weightedAccuracy,
    trialData.sdAccuracy,
    trialData.words,
    trialData.words.sks,
    id
  ];

  return (
    <Trial
      key={id}
      keyboardLayout={keyboardLayout}
      onAdvanceWorkflow={onAdvanceWorkflow}
      onLog={onLog}
      thresholdPositions={trialData.words}
      configData={configData}
    />
  );
}

TypingTask.propTypes = {
  text: PropTypes.string.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired,
  accuracy: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  taskDelay: PropTypes.number.isRequired,
  participant: PropTypes.string.isRequired,
  trialData: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.array])
  ).isRequired
};

export default TypingTask;
