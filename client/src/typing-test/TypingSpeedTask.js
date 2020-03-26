import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Devices, SuggestionTypes } from "../common/constants";
import useTrial from "../experiment/hooks/useTrial";
import TrialPresenter from "../experiment/components/TrialPresenter";

const phraseToWords = (phrase) => () => {
  const words = phrase.split(" ");
  return words.map((word, i) => {
    const isLast = i >= words.length - 1;
    return { word: word + (isLast ? "" : " "), sks: 0 };
  });
};

export default function TypingSpeedTask({
  onAdvanceWorkflow,
  onLog,
  device,
  isVirtualKeyboardEnabled,
  phrase,
  id,
}) {
  const suggestionsType = SuggestionTypes.none;
  const sksDistribution = useMemo(phraseToWords(phrase), [phrase]);

  const {
    dispatch,
    focusTarget,
    suggestions,
    input,
    keyboardLayoutName,
    isCompleted,
    hasErrors,
    text,
    isFullScreen,
  } = useTrial({
    suggestionsType,
    onComplete: onAdvanceWorkflow,
    onLog,
    initKeyStrokeDelay: 0,
    sksDistribution,
    totalSuggestions: 0,
    id,
    targetAccuracy: 0,
    weightedAccuracy: 0,
    sdAccuracy: 0,
  });

  return (
    <TrialPresenter
      dispatch={dispatch}
      focusTarget={focusTarget}
      suggestions={input === "" ? [] : suggestions}
      text={text}
      isFullScreen={isFullScreen}
      input={input}
      keyboardLayoutName={keyboardLayoutName}
      isCompleted={isCompleted}
      suggestionsType={suggestionsType}
      hasErrors={hasErrors}
      totalSuggestions={0}
      showsHelp={false}
      isVirtualKeyboardEnabled={isVirtualKeyboardEnabled}
      isSystemKeyboardEnabled={!isVirtualKeyboardEnabled}
      device={device}
    />
  );
}

TypingSpeedTask.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  device: PropTypes.oneOf(Object.values(Devices)).isRequired,
  phrase: PropTypes.string.isRequired,
  isVirtualKeyboardEnabled: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
};
