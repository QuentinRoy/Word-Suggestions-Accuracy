import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import TaskPaper from "./TaskPaper";
import style from "./styles/SwitchDeviceInstruction.module.scss";
import { useSharedModerationClient } from "../../common/contexts/ModerationClient";
import { ReadyStates, LogTypes } from "../../common/constants";

export default function SwitchDeviceInstruction({
  nextDevice,
  device: currentDevice,
  isCurrentDeviceDone,
  onAdvanceWorkflow,
}) {
  const { state, sendLog } = useSharedModerationClient();
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (state === ReadyStates.ready && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      sendLog(LogTypes.switchDevice, { nextDevice, isCurrentDeviceDone }).catch(
        () => {
          hasNotifiedRef.current = false;
        }
      );
    }
  }, [currentDevice, isCurrentDeviceDone, nextDevice, sendLog, state]);

  if (isCurrentDeviceDone) {
    return (
      <TaskPaper>
        <div className={style.content}>
          <p>You are done with your {currentDevice}.</p>
          <p>Please switch to your {nextDevice}.</p>
        </div>
      </TaskPaper>
    );
  }

  return (
    <TaskPaper>
      <div className={style.content}>
        <p>Please switch to your {nextDevice}.</p>
        <p>
          <strong>Do not press the continue button below yet. </strong>
          Only press the continue button when you are asked to go back to your{" "}
          {currentDevice}.
        </p>
        <div className={style.controls}>
          <Button
            variant="contained"
            color="primary"
            onClick={onAdvanceWorkflow}
          >
            Continue
          </Button>
        </div>
      </div>
    </TaskPaper>
  );
}
SwitchDeviceInstruction.propTypes = {
  device: PropTypes.string.isRequired,
  isCurrentDeviceDone: PropTypes.bool.isRequired,
  nextDevice: PropTypes.string.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
};
