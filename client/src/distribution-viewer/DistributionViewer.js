import React, { useState, useEffect } from "react";
import Slider from "@material-ui/core/Slider";
import useSentenceCorpus from "./useSentenceCorpus";
import SentenceSelect from "./SentenceSelect";
import ViewerContent from "./ViewerContent";
import {
  main,
  sentenceSelect,
  content,
  accuracySelect,
  standardDeviationSelect
} from "./DistributionViewer.module.css";
import useWindowSize from "../common/hooks/useWindowSize";
import getWordAccuracies from "./getWordAccuracies";
import Loading from "../common/components/Loading";
import Crashed from "../common/components/Crashed";
import { LoadingStates } from "../common/constants";

const KeyCodes = {
  left: 37,
  top: 38,
  right: 39,
  bottom: 40
};

const maxDiffAccuracy = 0.025;
const maxDiffSd = 0.1;
const setterMinStep = 0.01;

const DistributionViewer = () => {
  const [loadingState, corpus] = useSentenceCorpus();
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [accuracy, setAccuracy] = useState(0.5);
  const [sd, setSd] = useState(0.2);
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

  if (loadingState === LoadingStates.loading) {
    return <Loading>Loading corpus...</Loading>;
  }
  if (loadingState !== LoadingStates.loaded) {
    return <Crashed>Could not load the corpus...</Crashed>;
  }

  // Compute the sentence words accuracy.
  const { words, meanWordsKss, sdWordKss, totalKss } = getWordAccuracies(
    corpus[sentenceIndex],
    {
      targetKss: accuracy,
      targetSdWordKss: sd,
      maxDiffKss: maxDiffAccuracy,
      maxDiffSdKss: maxDiffSd
    }
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
          step={setterMinStep}
          valueLabelDisplay="on"
          onChange={(evt, value) => setAccuracy(value)}
          aria-labelledby="input-slider"
        />
      </div>
      <div className={standardDeviationSelect}>
        <div>Standard deviation:</div>
        <Slider
          min={0}
          max={0.5}
          value={sd}
          step={setterMinStep}
          valueLabelDisplay="on"
          onChange={(evt, value) => setSd(value)}
          aria-labelledby="input-slider"
        />
      </div>
      <div className={content}>
        <ViewerContent
          words={words}
          meanWordsKss={meanWordsKss}
          sdWordKss={sdWordKss}
          totalKss={totalKss}
          maxDiffAccuracy={maxDiffAccuracy}
          maxDiffSd={maxDiffSd}
          targetAccuracy={accuracy}
          targetSd={sd}
        />
      </div>
    </div>
  );
};

export default DistributionViewer;
