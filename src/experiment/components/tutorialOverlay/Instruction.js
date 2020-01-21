import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";

/* The context contains:
    - tutorialStep,
    - stimulusTextRect,
    - inputRect,
    - inlineSuggestionRect,
    - suggestionsBarRect,
    - suggestionsType,
    - virtualKeyboardRect,
    - isVirtualKeyboardEnabled,
    - totalSuggestions
*/

const Instruction = ({ children }) => {
  return (
    <div className={styles.instruction}>
      <div className={styles.box}>{children}</div>
    </div>
  );
};

Instruction.propTypes = {
  children: PropTypes.node.isRequired
};

export default Instruction;
