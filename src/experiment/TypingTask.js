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
    participant
  } = props;

  const thresholdPositions = useMemo(
    () => getWordAccuracies(text, 1 - accuracy, 0),
    [text, accuracy]
  );

  const trialStartTime = new Date();
  const configData = [
    participant,
    text,
    taskDelay,
    accuracy,
    trialStartTime,
    id
  ];

  return (
    <Trial
      key={id}
      keyboardLayout={keyboardLayout}
      onAdvanceWorkflow={onAdvanceWorkflow}
      onLog={onLog}
      thresholdPositions={thresholdPositions.words}
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
  participant: PropTypes.string.isRequired
};

export default TypingTask;
