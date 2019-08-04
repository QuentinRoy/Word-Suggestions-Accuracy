import React, { useState, useEffect, useRef, useReducer } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";
import getTrialLog from "./getTrialLog";
import { KeyboardLayoutNames, Actions } from "../utils/constants";
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

const mapVirtualKey = key => {
  switch (key) {
    case "{bksp}":
      return "Backspace";
    case "{tab}":
      return "Tab";
    case "{shift}":
      return "Shift";
    case "{lock}":
      return "CapsLock";
    case "{space}":
      return " ";
    default:
      return key;
  }
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
    pressedKeys: [],
    layoutName: keyboardLayout.layoutName,
    input: "",
    suggestions: getSuggestionsFromInput("")
  });

  // Returns a new state based on an action.
  const reducer = (state, action) => {
    console.log(state, action);
    switch (action.type) {
      case Actions.confirmAction:
        return reducer(state, action.action);
      default: {
        const newState = trialReducer(state, action);
        if (state === newState) return state;
        return {
          ...newState,
          suggestions: getSuggestionsFromInput(newState.input)
        };
      }
    }
  };

  const [
    { layoutName, input, suggestions, pressedKeys },
    dispatch
  ] = useReducer(reducer, null, initState);
  const actionScheduler = useActionScheduler(dispatch, keyStrokeDelay);

  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = React.createRef();
  const { current: trialStartTime } = useRef(new Date());

  const text = sksDistribution.map(w => w.word).join(" ");
  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect = text === input.trim();

  useEffect(() => {
    if (focusIndex === 0) {
      inputRef.current.focus();
    }
  }, [focusIndex, inputRef]);

  function onKeyDown(key) {
    if (pressedKeys.includes(key)) return;
    dispatch({ type: Actions.keyDown, key });
    if (pressedKeys.length > 0) return;
    switch (mapVirtualKey(key)) {
      case "Shift":
      case "CapsLock":
        actionScheduler.start({
          type: Actions.toggleLayout,
          layoutName: KeyboardLayoutNames.shift
        });
        break;
      case "{numbers}":
        actionScheduler.start({
          type: Actions.toggleNumberLayout,
          layoutName: KeyboardLayoutNames.numbers
        });
        break;
      case "{abc}":
        actionScheduler.start({
          type: Actions.toggleNumberLayout,
          layoutName: KeyboardLayoutNames.default
        });
        break;
      case "Backspace":
        actionScheduler.start({ type: Actions.deleteChar });
        break;
      case "Tab":
        actionScheduler.end();
        setFocusIndex((focusIndex + 1) % (totalSuggestions + 1));
        break;
      default:
        if (key.length === 1) {
          actionScheduler.start({ type: Actions.inputChar, char: key });
        }
    }
  }

  function onKeyUp(key) {
    dispatch({ type: Actions.keyUp, key: mapVirtualKey(key) });
  }

  function onPhysicalKeyDown(event) {
    if (keyboardLayout.id !== "physical") {
      event.preventDefault();
      return;
    }
    onKeyDown(event.key);
  }

  function onPhysicalKeyUp(event) {
    if (keyboardLayout.id !== "physical") {
      event.preventDefault();
      return;
    }
    onKeyUp(event.key);
  }

  return (
    <div
      onKeyDown={onPhysicalKeyDown}
      onKeyUp={onPhysicalKeyUp}
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
          if (pressedKeys.length === 0) {
            actionScheduler.start({
              type: Actions.inputSuggestion,
              word: selection
            });
          }
        }}
      />
      {keyboardLayout.id === "mobile" ? (
        <Keyboard
          display={keyboardLayout.display}
          layout={keyboardLayout.layout}
          layoutName={layoutName}
          onKeyDown={key => onKeyDown(key)}
          onKeyUp={key => onKeyUp(key)}
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
