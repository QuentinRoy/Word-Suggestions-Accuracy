import React, { useState, useEffect, useRef, useReducer } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";
import getTrialLog from "./getTrialLog";
import {
  KeyboardLayoutNames,
  ActionStatuses,
  Actions
} from "../utils/constants";
import { useDictionary } from "./useDictionary";
import getSuggestions from "./getSuggestions";
import "react-simple-keyboard/build/css/index.css";
import "./Trial.css";
import useActionScheduler from "./useActionScheduler";
import trialReducer from "./trialReducer";

const totalSuggestions = 3;

const countSimilarChars = (str1, str2) => {
  let correctCharsCount = 0;
  for (let i = 0; i < str1.length; i += 1) {
    if (str1[i] !== str2[i]) {
      break;
    }
    correctCharsCount += 1;
  }
  return correctCharsCount;
};

const Trial = ({
  keyboardLayout,
  onAdvanceWorkflow,
  onLog,
  keyStrokeDelay,
  sksDistribution,
  id,
  targetAccuracy,
  weightedAccuracy,
  sdAccuracy
}) => {
  const dictionary = useDictionary();
  const getSuggestionsFromInput = input =>
    getSuggestions(totalSuggestions, dictionary, sksDistribution, input);

  // Compute the initial state.
  const initState = () => ({
    events: [],
    layoutName: keyboardLayout.layoutName,
    input: "",
    suggestions: getSuggestionsFromInput(""),
    hasOnGoingAction: false
  });

  // Returns a new state based on an action.
  const reducer = (state, action) => {
    if (action.status === ActionStatuses.start) {
      return { ...state, hasOnGoingAction: true };
    }
    if (action.status === ActionStatuses.cancel) {
      return { ...state, hasOnGoingAction: false };
    }
    const newState = trialReducer(state, action);
    if (state === newState && !state.hasOnGoingAction) return state;
    return {
      ...newState,
      suggestions: getSuggestionsFromInput(newState.input),
      hasOnGoingAction: false
    };
  };

  const [
    { layoutName, input, suggestions, hasOnGoingAction },
    dispatch
  ] = useReducer(reducer, null, initState);

  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = React.createRef();
  const { current: trialStartTime } = useRef(new Date());
  const { scheduleAction, cancelAction } = useActionScheduler(
    dispatch,
    keyStrokeDelay
  );

  const text = sksDistribution.map(w => w.word).join(" ");
  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect = text === input.trim();

  useEffect(() => {
    if (focusIndex === 0) {
      inputRef.current.focus();
    }
  }, [focusIndex, inputRef]);

  function onKeyDownOrUp(key, isDown) {
    if (!isDown) cancelAction();
    if (hasOnGoingAction) return;
    switch (key) {
      case "{shift}":
      case "{lock}":
        cancelAction();
        if (isDown) {
          scheduleAction({
            type: Actions.toggleLayout,
            layoutName: KeyboardLayoutNames.shift
          });
        }
        break;
      case "{numbers}":
      case "{abc}":
        cancelAction();
        if (isDown) {
          scheduleAction({
            type: Actions.toggleNumberLayout,
            layoutName: KeyboardLayoutNames.numbers
          });
        }
        break;
      case "{bksp}":
        cancelAction();
        if (isDown) scheduleAction({ type: Actions.deleteChar });
        break;
      case "{space}":
        cancelAction();
        if (isDown) scheduleAction({ type: Actions.inputChar, char: " " });
        break;
      case "{tab}":
        cancelAction();
        if (isDown) setFocusIndex((focusIndex + 1) % (totalSuggestions + 1));
        break;
      default:
        if (key.length === 1) {
          cancelAction();
          if (isDown) {
            scheduleAction({ type: Actions.inputChar, char: key });
          }
        }
    }
  }

  function onPhysicalKeyPress(event, isDown) {
    if (keyboardLayout.id !== "physical") {
      event.preventDefault();
      return;
    }
    switch (event.key) {
      case "Backspace":
        onKeyDownOrUp("{bksp}", isDown);
        break;
      case "Tab":
        event.preventDefault();
        onKeyDownOrUp("{tab}");
        break;
      default:
        onKeyDownOrUp(event.key, isDown);
    }
  }

  return (
    <div
      onKeyDown={event => onPhysicalKeyPress(event, true)}
      onKeyUp={event => onPhysicalKeyPress(event, false)}
      role="button"
      tabIndex={0}
      style={{ outline: "none" }}
      ref={inputRef}
    >
      <TextToType
        text={text}
        correctCharsCount={correctCharsCount}
        input={input}
      />
      <input
        className="trial-input"
        value={`${input}|`}
        placeholder={
          keyboardLayout.id === "mobile"
            ? "Tap on the virtual keyboard to start"
            : "Tap on your keyboard to start"
        }
        readOnly={keyboardLayout.id === "mobile"}
      />
      <WordHelper
        mainSuggestionPosition={
          keyboardLayout.id === "physical"
            ? 0
            : Math.floor(totalSuggestions / 2)
        }
        totalSuggestions={totalSuggestions}
        focusedSuggestion={focusIndex > 0 ? focusIndex - 1 : null}
        suggestions={suggestions}
        selectionStart={selection => {
          if (!hasOnGoingAction) {
            scheduleAction({ type: Actions.inputSuggestion, word: selection });
          }
        }}
        selectionEnd={cancelAction}
      />
      {keyboardLayout.id === "mobile" ? (
        <Keyboard
          display={keyboardLayout.display}
          layout={keyboardLayout.layout}
          layoutName={layoutName}
          onKeyDown={event => onKeyDownOrUp(event, true)}
          onKeyUp={event => onKeyDownOrUp(event, false)}
        />
      ) : null}
      {isCorrect ? (
        <WorkflowButton
          onClick={() => {
            // onLog("events", eventList.current);
            // onLog(
            //   "log",
            //   getTrialLog(
            //     eventList.current, // eventList
            //     id, // id
            //     targetAccuracy, // targetAccuracy
            //     keyStrokeDelay, // delay
            //     weightedAccuracy, // weightedAccuracy
            //     sdAccuracy, // sdAccuracy
            //     words, // words
            //     trialStartTime.current, // trialStartTime
            //     new Date()
            //   )
            // );
            onAdvanceWorkflow();
          }}
        />
      ) : null}
    </div>
  );
};

Trial.propTypes = {
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyStrokeDelay: PropTypes.number.isRequired,
  sksDistribution: PropTypes.arrayOf(
    PropTypes.shape({
      word: PropTypes.string.isRequired,
      sks: PropTypes.number.isRequired
    })
  ).isRequired,
  targetAccuracy: PropTypes.number.isRequired,
  weightedAccuracy: PropTypes.number.isRequired,
  sdAccuracy: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired
};

export default Trial;
