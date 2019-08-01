import React from "react";
import PropTypes from "prop-types";
import styles from "./WorkflowButton.module.css";

export default function WorkflowButton({ onClick }) {
  return (
    <div className={styles.advanceWorkflowDiv}>
      <button
        type="button"
        onClick={onClick}
        className={styles.advanceWorkflowButton}
      >
        Continue
      </button>
    </div>
  );
}

WorkflowButton.propTypes = {
  onClick: PropTypes.func.isRequired
};
