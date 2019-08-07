import React from "react";
import PropTypes from "prop-types";
import styles from "./EndExperiment.module.css";

const EndExperiment = ({ uuid }) => {
  return (
    <div className={styles.main}>
      <div className={styles.content}>
        <h2>Thank you for your participation!</h2>
        Here is your confirmation code. Make sure you properly copy it in the
        corresponding text box on Amazon Mechanical Turk:
        <p className={styles.code}>{uuid}</p>
      </div>
    </div>
  );
};

EndExperiment.propTypes = {
  uuid: PropTypes.string.isRequired
};

export default EndExperiment;
