import React from "react";
import PropTypes from "prop-types";

export default function WorkflowButton({ isCorrect, onAdvanceWorkflow }) {
  return (
    <div className="advance-workflow-div">
      {isCorrect ? (
        <button
          type="button"
          onClick={onAdvanceWorkflow}
          className="advance-workflow-button"
        >
          Continue
        </button>
      ) : null}
    </div>
  );
}

WorkflowButton.propTypes = {
  isCorrect: PropTypes.bool.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired
};
