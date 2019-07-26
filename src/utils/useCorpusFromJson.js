import { useState, useEffect } from "react";

export const LOADING = "loading";
export const LOADED = "loaded";
export const CRASHED = "crashed";

export const accuracies = [0, 25, 50, 75, 100];
const filesLink = Array.from(
  accuracies.map(acc => {
    return `./sks-distributions/acc-${acc / 100}.json`;
  })
);

const fetchCorpus = async link => {
  const resp = await fetch(link);
  if (!resp.ok) {
    throw new Error(`Cannot fetch ${link}`);
  }
  const jsonContent = await resp.json();
  return jsonContent;
};

const useCorpusFromJson = () => {
  const [corpus, setCorpus] = useState(null);
  const [loadingState, setLoadingState] = useState(LOADING);

  useEffect(() => {
    Promise.all(filesLink.map(fetchCorpus))
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

export default useCorpusFromJson;
