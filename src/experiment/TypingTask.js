import React from "react";
import PropTypes from "prop-types";
import Trial from "./Trial";

function TypingTask({ id, ...otherProps }) {
  return <Trial key={id} id={id} {...otherProps} />;
}

TypingTask.propTypes = {
  id: PropTypes.string.isRequired
};

export default TypingTask;
