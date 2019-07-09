import React, { useState, useEffect } from "react";
import { shuffle } from "lodash";
import Slider from "@material-ui/core/Slider";
import useSentenceCorpus, { LOADING, CRASHED } from "./useSentenceCorpus";
import SentenceSelect from "./SentenceSelect";
import ViewerContent from "./ViewerContent";
import {
  main,
  sentenceSelect,
  content,
  accuracySelect
} from "./DistributionViewer.module.css";
import useWindowSize from "../utils/useWindowSize";

const KeyCodes = {
  left: 37,
  right: 39
};

const getWordAccuracies = (sentence, targetAccuracy) => {
  const words = sentence.split(" ").filter(s => s !== "");
  return words.map(w => ({ word: w, normalizedSks: targetAccuracy }));
};

const DistributionViewer = () => {
  const [loadingState, corpus] = useSentenceCorpus();
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [accuracy, setAccuracy] = useState(0.5);
  const { height: pageHeight } = useWindowSize();

  // Look for the left and right arrow key strokes to go to the next or the
  // previous sentence.
  useEffect(() => {
    if (corpus == null) return undefined;
    const handler = evt => {
      if (evt.keyCode === KeyCodes.left) {
        setSentenceIndex(
          sentenceIndex === 0 ? corpus.length - 1 : sentenceIndex - 1
        );
      } else if (evt.keyCode === KeyCodes.right) {
        setSentenceIndex((sentenceIndex + 1) % corpus.length);
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  });

  if (loadingState === LOADING) return <div>Loading...</div>;
  if (loadingState === CRASHED) return <div>Crashed...</div>;

  // Compute the sentence words accuracy.
  const words = getWordAccuracies(corpus[sentenceIndex], accuracy);

  return (
    <div className={main} style={{ height: pageHeight }}>
      <div className={sentenceSelect}>
        <SentenceSelect
          corpus={corpus}
          selectedIndex={sentenceIndex}
          setSelectedIndex={setSentenceIndex}
        />
      </div>
      <div className={accuracySelect}>
        <div>Accuracy:</div>
        <Slider
          min={0}
          max={1}
          value={accuracy}
          step={0.01}
          valueLabelDisplay="on"
          onChange={(evt, value) => setAccuracy(value)}
          aria-labelledby="input-slider"
        />
      </div>
      <div className={content}>
        <ViewerContent words={words} />
      </div>
    </div>
  );
};

export default DistributionViewer;
