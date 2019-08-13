import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import Instructions from "./Instructions";
import InstructionsTest from "./InstructionsTest";

const InstructionWrapper = ({ onAdvanceWorkflow, onLog }) => {
  const [instructionPassed, setInstructionPassed] = useState(false);
  const [readingCount, setReadingCount] = useState(0);
  const answersEntered = useRef([]);
  const instructionsReadingStartTime = new Date();

  if (!instructionPassed) {
    return (
      <Instructions
        setInstructionPassed={setInstructionPassed}
        setReadingCount={setReadingCount}
        readingCount={readingCount}
      />
    );
  }
  return (
    <InstructionsTest
      onAdvanceWorkflow={onAdvanceWorkflow}
      onLog={onLog}
      setInstructionPassed={setInstructionPassed}
      readingCount={readingCount}
      answersEntered={answersEntered}
      instructionsReadingStartTime={instructionsReadingStartTime}
    />
  );
};

InstructionWrapper.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired
};

export default InstructionWrapper;
