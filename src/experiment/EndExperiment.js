import React from "react";
import PropTypes from "prop-types";
import styles from "./EndExperiment.module.css";

const EndExperiment = ({ uuid }) => {
  return (
    <div className={styles.header}>
      <p className={styles.content}>
        <span>
          Thank you for completing this experiment, here is you AMT code:
        </span>
        <span>
          <strong> {uuid}</strong>
        </span>
      </p>
    </div>
  );
};

EndExperiment.propTypes = {
  uuid: PropTypes.string.isRequired
};

export default EndExperiment;
