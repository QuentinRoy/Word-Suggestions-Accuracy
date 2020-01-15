import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import last from "lodash/last";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";

import StartupInstructions from "./StartupInstructions";
import StartupQuestionnaire from "./StartupQuestionnaire";

const Startup = ({ onAdvanceWorkflow, onLog, numberOfPracticeTasks }) => {
  const [areInstructionPassed, setAreInstructionPassed] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { current: logs } = useRef([{ startDate: new Date() }]);
  const lastLog = last(logs);

  if (!areInstructionPassed) {
    return (
      <StartupInstructions
        numberOfPracticeTasks={numberOfPracticeTasks}
        onStart={() => {
          lastLog.instructionEndDate = new Date();
          setAreInstructionPassed(true);
        }}
      />
    );
  }

  const handleQuestionnaireSubmit = (isCorrect, answers) => {
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
      setIsAlertOpen(true);
    }
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
    setAreInstructionPassed(false);
    logs.push({ startDate: new Date() });
  };

  return (
    <>
      <StartupQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      <Dialog
        open={isAlertOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Sorry, this is not quite correct.
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please, read the instructions again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertClose} color="primary" autoFocus>
            Start again
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Startup.propTypes = {
  onLog: PropTypes.func.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  numberOfPracticeTasks: PropTypes.number.isRequired
};

export default Startup;
