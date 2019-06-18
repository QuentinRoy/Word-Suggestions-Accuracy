import React from "react";
import Trial from "./Trial";
import Loading from "./Loading";
import useDictionary, { LOADED, LOADING } from "./useDictionary";

function App() {
  const [dictionaryLoadingState, dictionary] = useDictionary();

  switch (dictionaryLoadingState) {
    case LOADED:
      return <Trial text="hello there" dictionary={dictionary} />;
    case LOADING:
      return <Loading />;
    default:
      return <div>Oh nooo...</div>;
  }
}

export default App;
