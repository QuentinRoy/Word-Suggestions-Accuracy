import { useState, useEffect } from "react";
import { LoadingStates } from "../utils/constants";

const url = `./sentences.txt`;

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
  const [loadingState, setLoadingState] = useState(LoadingStates.loading);

  useEffect(() => {
    fetchCorpus(url)
      .then(corpusResult => {
        setCorpus(corpusResult);
        setLoadingState(LoadingStates.loaded);
      })
      .catch(() => {
        setLoadingState(LoadingStates.crashed);
      });
  }, []);

  return [loadingState, corpus];
};

export default useSentenceCorpus;
