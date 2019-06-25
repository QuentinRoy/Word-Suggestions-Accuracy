import React from "react";
import PropTypes from "prop-types";
import Trial from "./Trial";
import useDictionary, { LOADED, LOADING } from "./useDictionary";
import Loading from "./Loading";

function App({ text, onAdvanceWorkflow, onLog, keyboardLayout }) {
  const [dictionaryLoadingState, dictionary] = useDictionary();

  switch (dictionaryLoadingState) {
    case LOADED:
      return (
        <Trial
          text={text}
          dictionary={dictionary}
          keyboardLayout={keyboardLayout}
          onAdvanceWorkflow={onAdvanceWorkflow}
          onLog={onLog}
        />
      );
    case LOADING:
      return <Loading />;
    default:
      return <div>Oh nooo...</div>;
  }
}

App.propTypes = {
  text: PropTypes.string.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired
};

export default App;
