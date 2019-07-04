import React from "react";
import PropTypes from "prop-types";
import Trial from "./Trial";
import useDictionary, { LOADED, LOADING } from "./useDictionary";
import useTrialText, {
  LOADED_TRIAL_TEXT,
  LOADING_TRIAL_TEXT
} from "./useTrialText";
import Loading from "./Loading";

function App({ onAdvanceWorkflow, onLog, keyboardLayout, accuracy }) {
  const [dictionaryLoadingState, dictionary] = useDictionary();
  const [trialTextLoadingState, trialText] = useTrialText();

  switch (dictionaryLoadingState) {
    case LOADED:
      if (trialTextLoadingState === LOADED_TRIAL_TEXT) {
        return (
          <Trial
            text={trialText}
            dictionary={dictionary}
            keyboardLayout={keyboardLayout}
            onAdvanceWorkflow={onAdvanceWorkflow}
            onLog={onLog}
            accuracy={accuracy}
          />
        );
      }
      if (trialTextLoadingState === LOADING_TRIAL_TEXT) {
        return <Loading />;
      }
      return <div>Something went wrong...</div>;
    case LOADING:
      return <Loading />;
    default:
      return <div>Oh nooo...</div>;
  }
}

App.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired,
  accuracy: PropTypes.number.isRequired
};

export default App;
