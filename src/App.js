import React, { useState } from "react";
import PropTypes from "prop-types";
import useDictionary, { LOADED, LOADING } from "./useDictionary";
import Trial from "./Trial";
import Loading from "./Loading";
import KeyboardSelector from "./KeyboardSelector";

function App({ text, onAdvanceWorkflow, onLog }) {
  const [dictionaryLoadingState, dictionary] = useDictionary();
  const [keyboardLayout, setKeyboardLayout] = useState(null);

  switch (dictionaryLoadingState) {
    case LOADED:
      if (keyboardLayout === null) {
        return <KeyboardSelector setKeyboardLayout={setKeyboardLayout} />;
      }
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
  onLog: PropTypes.func.isRequired
};

export default App;
