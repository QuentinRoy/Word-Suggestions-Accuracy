import React, { useState, useEffect, createContext, useContext } from "react";
import PropTypes from "prop-types";
import { parse } from "papaparse";
import Loading from "../../utils/Loading";
import Crashed from "../../utils/Crashed";
import { LoadingStates } from "../../utils/constants";

const path = "./dictionaries_en_US_wordlist.csv";

const DictionaryContext = createContext();

export const useDictionary = () => {
  const dictionary = useContext(DictionaryContext);
  return dictionary;
};

const DictionaryProvider = ({ children }) => {
  const [dictionary, setDictionary] = useState(null);
  const [loadingState, setLoadingState] = useState(LoadingStates.loading);

  useEffect(() => {
    parse(path, {
      download: true,
      header: true,
      skipEmptyLines: "greedy",
      transform(value, columnName) {
        switch (columnName) {
          case "f":
            return +value; // Convert f to a number
          default:
            return value;
        }
      },
      complete(results) {
        setDictionary(results.data);
        setLoadingState(LoadingStates.loaded);
      },
      error() {
        setLoadingState(LoadingStates.crashed);
      }
    });
  }, []);

  switch (loadingState) {
    case LoadingStates.loaded:
      return (
        <DictionaryContext.Provider value={dictionary}>
          {children}
        </DictionaryContext.Provider>
      );
    case LoadingStates.loading:
      return <Loading>Loading dictionary...</Loading>;
    default:
      return <Crashed>Failed to load the dictionary...</Crashed>;
  }
};

DictionaryProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default DictionaryProvider;
