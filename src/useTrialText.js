import { useState, useEffect } from "react";

export const LOADING_TRIAL_TEXT = "loading";
export const LOADED_TRIAL_TEXT = "loaded";
export const CRASHED_TRIAL_TEXT = "crashed";

const url = Array(`./phrases.txt`);

const fetchTxt = async link => {
  const resp = await fetch(link);
  if (!resp.ok) {
    throw new Error(`Cannot fetch ${link}`);
  }
  const txtContent = await resp.text();
  return txtContent.split("\n");
};

const useTrialText = () => {
  const [trialText, setTrialText] = useState(null);
  const [loadingState, setLoadingState] = useState(LOADING_TRIAL_TEXT);

  useEffect(() => {
    Promise.all(url.map(fetchTxt))
      .then(text => {
        setTrialText(text.flat()[Math.floor(Math.random() * 500)]);
        setLoadingState(LOADED_TRIAL_TEXT);
      })
      .catch(err => {
        setLoadingState(CRASHED_TRIAL_TEXT);
      });
  }, []);

  return [loadingState, trialText];
};

export default useTrialText;
