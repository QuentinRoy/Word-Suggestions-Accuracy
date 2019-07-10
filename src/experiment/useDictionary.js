import { useState, useEffect } from "react";
import { parse } from "papaparse";

export const LOADING = "loading";
export const LOADED = "loaded";
export const CRASHED = "crashed";

const path = "./dictionaries_en_US_wordlist.csv";

const useDictionary = () => {
  const [dict, setDict] = useState(null);
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
        setDict(results.data);
        setLoadingState(LOADED);
      },
      error() {
        setLoadingState(CRASHED);
      }
    });
  }, []);

  return [loadingState, dict];
};

export default useDictionary;
