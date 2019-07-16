import React, { useState, useEffect, createContext, useContext } from "react";
import PropTypes from "prop-types";
import { parse } from "papaparse";

export const LOADING = "loading";
export const LOADED = "loaded";
export const CRASHED = "crashed";

const path = "./dictionaries_en_US_wordlist.csv";

const DictionaryContext = createContext();

export const useDictionary = () => {
  const dictionary = useContext(DictionaryContext);
  return dictionary;
};

const DictionaryProvider = ({ children }) => {
  const [dictionary, setDictionary] = useState(null);
  const [loadingState, setLoadingState] = useState(LOADING);

  useEffect(() => {
    parse(path, {
      download: true,
      header: true,
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
        setLoadingState(LOADED);
      },
      error() {
        setLoadingState(CRASHED);
      }
    });
  }, []);

  switch (loadingState) {
    case LOADED:
      return (
        <DictionaryContext.Provider value={dictionary}>
          {children}
        </DictionaryContext.Provider>
      );
    case LOADING:
      return <div>Loading dictionary...</div>;
    default:
      return <div>Loading dictionary crashed...</div>;
  }
};

DictionaryProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default DictionaryProvider;
