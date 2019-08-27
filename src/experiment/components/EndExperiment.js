import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/EndExperiment.module.css";
import TaskPaper from "./TaskPaper";

const EndExperiment = ({ confirmationCode }) => {
  return (
    <TaskPaper>
      <h1>Thank you!</h1>
      Here is your confirmation code. Make sure you properly copy it in the
      corresponding text box on Amazon Mechanical Turk:
      <p className={styles.code}>{confirmationCode}</p>
    </TaskPaper>
  );
};

EndExperiment.propTypes = {
  confirmationCode: PropTypes.string.isRequired
};

export default EndExperiment;
