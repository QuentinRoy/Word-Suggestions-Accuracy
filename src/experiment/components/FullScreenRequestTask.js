import React from "react";
import PropTypes from "prop-types";
import FullScreenRequest from "./FullScreenRequest";
import TaskPaper from "./TaskPaper";

export default function FullScreenRequestTask({ onAdvanceWorkflow }) {
  return (
    <TaskPaper>
      <FullScreenRequest onFullScreen={onAdvanceWorkflow} />
    </TaskPaper>
  );
}

FullScreenRequestTask.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired
};
