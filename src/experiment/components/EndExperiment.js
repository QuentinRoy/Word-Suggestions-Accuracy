import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/EndExperiment.module.css";

const EndExperiment = ({ confirmationCode }) => {
  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <h2>Thank you for your participation!</h2>
        Here is your confirmation code. Make sure you properly copy it in the
        corresponding text box on Amazon Mechanical Turk:
        <p className={styles.code}>{confirmationCode}</p>
      </div>
    </div>
  );
};

EndExperiment.propTypes = {
  confirmationCode: PropTypes.string.isRequired
};

export default EndExperiment;
