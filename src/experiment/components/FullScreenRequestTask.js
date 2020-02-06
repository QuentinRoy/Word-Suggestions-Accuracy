import React from "react";
import PropTypes from "prop-types";
import FullScreenRequest from "./FullScreenRequest";

export default function FullScreenRequestTask({ onAdvanceWorkflow }) {
  return <FullScreenRequest onFullScreen={onAdvanceWorkflow} />;
}

FullScreenRequestTask.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired
};
