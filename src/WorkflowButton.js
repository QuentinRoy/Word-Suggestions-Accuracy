import React from "react";
import PropTypes from "prop-types";
import styles from "./WorkflowButton.module.css";

export default function WorkflowButton({ isCorrect, onAdvanceWorkflow }) {
  return (
    <div className={styles.advanceWorkflowDiv}>
      {isCorrect ? (
        <button
          type="button"
          onClick={onAdvanceWorkflow}
          className={styles.advanceWorkflowButton}
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
