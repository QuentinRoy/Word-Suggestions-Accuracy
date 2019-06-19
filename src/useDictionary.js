import { useState, useEffect } from "react";

export const LOADING = "loading";
export const LOADED = "loaded";
export const CRASHED = "crashed";

const urls = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(
  letter => `./Word_lists_csv/${letter}word.txt`
);

const fetchCSV = async url => {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Cannot fetch ${url}`);
  }
  const csvContent = await resp.text();
  return csvContent.split("\n").map(w => w.trim());
};

const useDictionary = () => {
  const [dict, setDict] = useState(null);
  const [loadingState, setLoadingState] = useState(LOADING);

  useEffect(() => {
    Promise.all(urls.map(fetchCSV))
      .then(wordLists => {
        const words = wordLists.flat();
        setDict(words);
        setLoadingState(LOADED);
      })
      .catch(() => {
        setLoadingState(CRASHED);
      });
  }, []);

  return [loadingState, dict];
};

export default useDictionary;
