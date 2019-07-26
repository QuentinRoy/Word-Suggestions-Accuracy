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
    id
  } = props;

  const thresholdPositions = useMemo(
    () => getWordAccuracies(text, 1 - accuracy, 0),
    [text, accuracy]
  );

  return (
    <Trial
      key={id}
      text={text}
      keyboardLayout={keyboardLayout}
      onAdvanceWorkflow={onAdvanceWorkflow}
      onLog={onLog}
      thresholdPositions={thresholdPositions.words}
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
  id: PropTypes.number.isRequired
};

export default TypingTask;
