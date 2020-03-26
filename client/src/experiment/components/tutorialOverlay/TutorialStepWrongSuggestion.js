import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import Instruction from "./Instruction";
import { SuggestionTypes } from "../../../common/constants";
import TopOfBarWrapper from "./TopOfBarWrapper";

const TutorialStepWrongSuggestion = ({ suggestionsType, totalSuggestions }) => (
  <div className={styles.stepWrongSuggestion}>
    <TopOfBarWrapper>
      <Instruction>
        Now{" "}
        {suggestionsType === SuggestionTypes.bar && totalSuggestions > 1
          ? "accept the second "
          : "accept the "}
        suggestion{totalSuggestions === 1 ? "again" : ""}.
      </Instruction>
    </TopOfBarWrapper>
  </div>
);
TutorialStepWrongSuggestion.propTypes = {
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired,
  totalSuggestions: PropTypes.number.isRequired,
};

export default TutorialStepWrongSuggestion;
