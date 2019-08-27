import React from "react";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import styles from "./styles/EndExperiment.module.css";

const EndExperiment = ({ confirmationCode }) => {
  return (
    <Paper className={styles.main}>
      <h1>Thank you!</h1>
      Here is your confirmation code. Make sure you properly copy it in the
      corresponding text box on Amazon Mechanical Turk:
      <p className={styles.code}>{confirmationCode}</p>
    </Paper>
  );
};

EndExperiment.propTypes = {
  confirmationCode: PropTypes.string.isRequired
};

export default EndExperiment;
