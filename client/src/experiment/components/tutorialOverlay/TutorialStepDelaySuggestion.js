import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";
import { SuggestionTypes } from "../../../utils/constants";

const TutorialStepDelaySuggestion = ({
  presenterBottom,
  suggestionsType,
  totalSuggestions
}) => (
  <div className={styles.stepDelaySuggestion} style={{ top: presenterBottom }}>
    <Info>Impairment also applies to suggestion.</Info>
    <Instruction>
      Now accept the
      {suggestionsType === SuggestionTypes.bar && totalSuggestions > 1
        ? " first "
        : " "}
      suggestion.
    </Instruction>
  </div>
);
TutorialStepDelaySuggestion.propTypes = {
  presenterBottom: PropTypes.number.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired,
  totalSuggestions: PropTypes.number.isRequired
};

export default TutorialStepDelaySuggestion;
