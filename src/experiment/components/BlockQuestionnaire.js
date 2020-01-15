import React from "react";
import PropTypes from "prop-types";

export default function BlockQuestionnaire({ onAdvanceWorkflow }) {
  return (
    <div>
      <p>WORK IN PROGRESS</p>
      <button type="button" onClick={onAdvanceWorkflow}>
        continue
      </button>
    </div>
  );
}

BlockQuestionnaire.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired
};
