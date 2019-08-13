import React, { useState } from "react";
import PropTypes from "prop-types";
import Instructions from "./Instructions";
import InstructionsTest from "./InstructionsTest";

const InstructionWrapper = ({ onAdvanceWorkflow }) => {
  const [areInstructionPassed, setAreInstructionPassed] = useState(false);

  if (!areInstructionPassed) {
    return <Instructions onStart={() => setAreInstructionPassed(true)} />;
  }
  return (
    <InstructionsTest
      onSubmit={isCorrect => {
        if (isCorrect) onAdvanceWorkflow();
        else setAreInstructionPassed(false);
      }}
    />
  );
};

InstructionWrapper.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default InstructionWrapper;
