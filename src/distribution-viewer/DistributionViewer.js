import React, { useState, useEffect } from "react";
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
import getWordAccuracies from "./getWordAccuracies";

const KeyCodes = {
  left: 37,
  top: 38,
  right: 39,
  bottom: 40
};

const accuracyMinStep = 0.01;

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
      if (evt.keyCode === KeyCodes.top) {
        evt.preventDefault();
        // If the slider is focused, it will automatically move when arrow keys
        //  are pressed. The next line overrides this behavior.
        setAccuracy(accuracy);
        document.activeElement.blur();
        setSentenceIndex(
          sentenceIndex === 0 ? corpus.length - 1 : sentenceIndex - 1
        );
      } else if (evt.keyCode === KeyCodes.bottom) {
        evt.preventDefault();
        document.activeElement.blur();
        setAccuracy(accuracy);
        setSentenceIndex((sentenceIndex + 1) % corpus.length);
      } else if (evt.keyCode === KeyCodes.left) {
        evt.preventDefault();
        setAccuracy(Math.max(0, Math.ceil(accuracy * 10 - 1) / 10));
      } else if (evt.keyCode === KeyCodes.right) {
        evt.preventDefault();
        setAccuracy(Math.min(1, Math.floor(accuracy * 10 + 1) / 10));
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
  const { words, score, meanAccuracy, sdAccuracy } = getWordAccuracies(
    corpus[sentenceIndex],
    accuracy,
    0
  );

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
          step={accuracyMinStep}
          valueLabelDisplay="on"
          onChange={(evt, value) => setAccuracy(value)}
          aria-labelledby="input-slider"
        />
      </div>
      <div className={content}>
        <ViewerContent
          words={words}
          score={score}
          meanAccuracy={meanAccuracy}
          sdAccuracy={sdAccuracy}
        />
      </div>
    </div>
  );
};

export default DistributionViewer;
