import React, { useState } from "react";
import PropTypes from "prop-types";
import Instructions from "./Instructions";
import InstructionsTest from "./InstructionsTest";

const InstructionWrapper = ({ onAdvanceWorkflow }) => {
  const [instructionPassed, setInstructionPassed] = useState(false);

  if (!instructionPassed) {
    return <Instructions setInstructionPassed={setInstructionPassed} />;
  }
  return (
    <InstructionsTest
      onAdvanceWorkflow={onAdvanceWorkflow}
      setInstructionPassed={setInstructionPassed}
    />
  );
};

InstructionWrapper.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default InstructionWrapper;
