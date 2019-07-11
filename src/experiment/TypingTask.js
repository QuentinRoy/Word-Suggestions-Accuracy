import React from "react";
import PropTypes from "prop-types";
import Trial from "./Trial";
import useDictionary, { LOADED, LOADING } from "./useDictionary";
import Loading from "./Loading";
import getWordAccuracies from "../utils/getWordAccuracies";

function TypingTask({
  text,
  onAdvanceWorkflow,
  onLog,
  keyboardLayout,
  accuracy
}) {
  const [dictionaryLoadingState, dictionary] = useDictionary();
  let thresholdPositions;

  switch (dictionaryLoadingState) {
    case LOADED:
      thresholdPositions = getWordAccuracies(text, accuracy, 0);
      return (
        <Trial
          text={text}
          dictionary={dictionary}
          keyboardLayout={keyboardLayout}
          onAdvanceWorkflow={onAdvanceWorkflow}
          onLog={onLog}
          accuracy={accuracy}
          thresholdPositions={thresholdPositions.words}
        />
      );
    case LOADING:
      return <Loading />;
    default:
      return <div>Oh nooo...</div>;
  }
}

TypingTask.propTypes = {
  text: PropTypes.string.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired,
  accuracy: PropTypes.number.isRequired
};

export default TypingTask;
