import React from "react";
import PropTypes from "prop-types";
import styles from "./KeyboardSelector.module.css";
import { KeyboardLayouts } from "../utils/constants";

const KeyboardSelector = ({ onEditConfig, onAdvanceWorkflow }) => {
  return (
    <div className={styles.keyboardSelectorDiv}>
      <p>I am typing on:</p>
      <div>
        <button
          className={styles.keyboardSelectorButton}
          type="button"
          onClick={() => {
            onEditConfig("keyboardLayout", KeyboardLayouts.mobileLayout);
            onAdvanceWorkflow();
          }}
        >
          Mobile
        </button>
        <button
          className={styles.keyboardSelectorButton}
          type="button"
          onClick={() => {
            onEditConfig("keyboardLayout", KeyboardLayouts.desktopLayout);
            onAdvanceWorkflow();
          }}
        >
          Desktop
        </button>
      </div>
    </div>
  );
};

KeyboardSelector.propTypes = {
  onEditConfig: PropTypes.func.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default KeyboardSelector;
