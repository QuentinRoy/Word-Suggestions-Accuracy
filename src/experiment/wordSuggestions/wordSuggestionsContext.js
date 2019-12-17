import React, { useState, useEffect, createContext, useContext } from "react";
import PropTypes from "prop-types";
import Loading from "../../utils/Loading";
import Crashed from "../../utils/Crashed";
import { LoadingStates } from "../../utils/constants";
import fetchDictionary from "./fetchDictionary";
import SuggestionsEngine from "./SuggestionsEngine";

const WordSuggestionsContext = createContext();

export const useDictionary = () => {
  const dictionary = useContext(WordSuggestionsContext);
  return dictionary;
};

export const WordSuggestionsEngineProvider = ({
  dictionaryPath,
  children,
  loadingMessage,
  crashedMessage
}) => {
  const [engine, setEngine] = useState(null);
  const [loadingState, setLoadingState] = useState(LoadingStates.loading);

  useEffect(() => {
    setLoadingState(LoadingStates.loading);
    setEngine(null);
    fetchDictionary(dictionaryPath)
      .then(dictionary => {
        setEngine(SuggestionsEngine(dictionary));
        setLoadingState(LoadingStates.loaded);
      })
      .catch(() => {
        setLoadingState(LoadingStates.crashed);
        setEngine(null);
      });
  }, [dictionaryPath]);

  switch (loadingState) {
    case LoadingStates.loaded:
      return (
        <WordSuggestionsContext.Provider value={engine}>
          {children}
        </WordSuggestionsContext.Provider>
      );
    case LoadingStates.loading:
      return <Loading>{loadingMessage}</Loading>;
    default:
      return <Crashed>{crashedMessage}</Crashed>;
  }
};

WordSuggestionsEngineProvider.propTypes = {
  dictionaryPath: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  loadingMessage: PropTypes.node,
  crashedMessage: PropTypes.node
};

WordSuggestionsEngineProvider.defaultProps = {
  loadingMessage: "Loading dictionary...",
  crashedMessage: "Failed to load the dictionary..."
};

export const useWordSuggestionsEngine = () => {
  return useContext(WordSuggestionsContext);
};
