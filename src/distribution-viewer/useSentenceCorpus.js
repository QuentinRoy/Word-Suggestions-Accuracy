import { useState, useEffect } from "react";

export const LOADING = "loading";
export const LOADED = "loaded";
export const CRASHED = "crashed";

const url = Array(`./phrases.txt`);

const fetchCorpus = async link => {
  const resp = await fetch(link);
  if (!resp.ok) {
    throw new Error(`Cannot fetch ${link}`);
  }
  const txtContent = await resp.text();
  return txtContent
    .split("\n")
    .map(s => s.trim())
    .filter(s => s !== "");
};

const useSentenceCorpus = () => {
  const [corpus, setCorpus] = useState(null);
  const [loadingState, setLoadingState] = useState(LOADING);

  useEffect(() => {
    fetchCorpus(url)
      .then(corpusResult => {
        setCorpus(corpusResult);
        setLoadingState(LOADED);
      })
      .catch(() => {
        setLoadingState(CRASHED);
      });
  }, []);

  return [loadingState, corpus];
};

export default useSentenceCorpus;
