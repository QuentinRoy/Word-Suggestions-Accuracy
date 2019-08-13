import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import last from "lodash/last";
import StartupInstructions from "./StartupInstructions";
import StartupTest from "./StartupTest";

const Startup = ({ onAdvanceWorkflow, onLog }) => {
  const [areInstructionPassed, setAreInstructionPassed] = useState(false);
  const { current: logs } = useRef([{ startDate: new Date() }]);
  const lastLog = last(logs);

  if (!areInstructionPassed) {
    return (
      <StartupInstructions
        onStart={() => {
          lastLog.instructionEndDate = new Date();
          setAreInstructionPassed(true);
        }}
      />
    );
  }
  return (
    <StartupTest
      onSubmit={(isCorrect, answers) => {
        lastLog.testEndDate = new Date();
        lastLog.testIsCorrect = isCorrect;
        lastLog.testAnswers = answers;
        lastLog.instructionDuration =
          lastLog.instructionEndDate - lastLog.startDate;
        lastLog.instructionDuration =
          lastLog.instructionEndDate - lastLog.testEndDate;
        if (isCorrect) {
          onLog("trials", logs);
          onAdvanceWorkflow();
        } else {
          logs.push({ startDate: new Date() });
          setAreInstructionPassed(false);
        }
      }}
    />
  );
};

Startup.propTypes = {
  onLog: PropTypes.func.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default Startup;
