import React, { useState } from "react";
import Trial from "./Trial";
import Loading from "./Loading";
import KeyboardSelector from "./KeyboardSelector";
import useDictionary, { LOADED, LOADING } from "./useDictionary";

function App() {
  const [dictionaryLoadingState, dictionary] = useDictionary();
  const [keyboardLayout, setKeyboardLayout] = useState(null);

  switch (dictionaryLoadingState) {
    case LOADED:
      if (keyboardLayout === null) {
        return <KeyboardSelector setKeyboardLayout={setKeyboardLayout} />;
      }
      return (
        <Trial
          text="hello there"
          dictionary={dictionary}
          keyboardLayout={keyboardLayout}
        />
      );
    case LOADING:
      return <Loading />;
    default:
      return <div>Oh nooo...</div>;
  }
}

export default App;
