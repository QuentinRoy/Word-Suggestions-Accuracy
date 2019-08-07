import React, { useEffect, useRef, useReducer } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";
import getTrialLog from "./getTrialLog";
import {
  KeyboardLayoutNames,
  Actions,
  totalSuggestions
} from "../utils/constants";
import { useDictionary } from "./useDictionary";
import getSuggestions from "./getSuggestions";
import "react-simple-keyboard/build/css/index.css";
import useActionScheduler from "./useActionScheduler";
import trialReducer from "./trialReducer";
import getEventLog from "./getEventLog";
import styles from "./Trial.module.css";

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

// This actions won't be logged.
const noEventActions = [
  Actions.keyDown,
  Actions.keyUp,
  Actions.endAction,
  Actions.confirmAction
];

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
    focusTarget: "input",
    suggestions: getSuggestionsFromInput("")
  });

  // Returns a new state based on an action.
  const reducer = (state, action) => {
    console.log(state, action);
    const isActionLogged = noEventActions.includes(action.type);
    const reducedState = trialReducer(state, action);
    if (reducedState === state && !isActionLogged) return state;
    const suggestions =
      state.input === reducedState.input
        ? state.suggestions
        : getSuggestionsFromInput(reducedState.input);
    const events = isActionLogged
      ? [
          ...reducedState.events,
          getEventLog(state, action, reducedState, { sksDistribution })
        ]
      : reducedState.events;
    const finalState = { ...reducedState, suggestions, events };
    return action.type === Actions.confirmAction
      ? reducer(finalState, action.action)
      : finalState;
  };

  const [
    { layoutName, input, suggestions, pressedKeys, focusTarget, events },
    dispatch
  ] = useReducer(reducer, null, initState);
  const actionScheduler = useActionScheduler(dispatch, keyStrokeDelay);

  const inputRef = React.createRef();
  const { current: trialStartTime } = useRef(new Date());

  const text = sksDistribution.map(w => w.word).join(" ");
  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect = text === input.trim();

  useEffect(() => {
    if (focusTarget === "input") inputRef.current.focus();
  }, [focusTarget, inputRef]);

  function onFinishTrial() {
    actionScheduler.endAll();
    onLog("events", events);
    onLog(
      "trial",
      getTrialLog(
        events,
        id,
        targetAccuracy,
        keyStrokeDelay,
        weightedAccuracy,
        sdAccuracy,
        sksDistribution,
        trialStartTime,
        new Date()
      )
    );
    onAdvanceWorkflow();
  }

  function onKeyDown(key) {
    if (pressedKeys.includes(key)) return;
    dispatch({ type: Actions.keyDown, key });
    switch (mapVirtualKey(key)) {
      case "Shift":
      case "CapsLock":
        actionScheduler.endAll();
        actionScheduler.start(`key-${key}`, {
          type: Actions.toggleLayout,
          layoutName: KeyboardLayoutNames.shift
        });
        break;
      case "{numbers}":
        actionScheduler.endAll();
        actionScheduler.start(`key-${key}`, {
          type: Actions.toggleLayout,
          layoutName: KeyboardLayoutNames.numbers
        });
        break;
      case "{abc}":
        actionScheduler.endAll();
        actionScheduler.start(`key-${key}`, {
          type: Actions.toggleLayout,
          layoutName: KeyboardLayoutNames.default
        });
        break;
      case "Tab":
        actionScheduler.endAll();
        dispatch({ type: Actions.switchFocus, totalSuggestions });
        break;
      case "Backspace":
        if (focusTarget === "input") {
          actionScheduler.endAll();
          actionScheduler.start(`key-${key}`, { type: Actions.deleteChar });
        }
        break;
      case "Enter":
        if (focusTarget === "input" && isCorrect) {
          onFinishTrial();
        }
        break;
      default:
        actionScheduler.endAll();
        // Case the key is a character.
        if (key.length === 1 && focusTarget === "input") {
          actionScheduler.start(`char-${key}`, {
            type: Actions.inputChar,
            char: key
          });
        }
    }
  }

  function onKeyUp(key) {
    switch (key) {
      case "Shift":
      case "CapsLock":
      case "{numbers}":
      case "{abc}":
        actionScheduler.end(`key-${key}`);
        break;
      default:
        if (key.length === 1) {
          actionScheduler.end(`char-${key}`);
        }
    }
    dispatch({ type: Actions.keyUp, key: mapVirtualKey(key) });
  }

  function onPhysicalKeyUp(event) {
    if (keyboardLayout.id !== "physical") {
      event.preventDefault();
      return;
    }
    onKeyUp(event.key);
  }

  function onPhysicalKeyDown(event) {
    event.preventDefault();
    if (keyboardLayout.id === "physical") onKeyDown(event.key);
  }

  return (
    <div
      onKeyDown={onPhysicalKeyDown}
      onKeyUp={onPhysicalKeyUp}
      role="textbox"
      tabIndex={0}
      className={styles.main}
      ref={inputRef}
    >
      <TextToType
        text={text}
        correctCharsCount={correctCharsCount}
        input={input}
      />
      <input
        className={
          focusTarget === "input"
            ? `${styles.trialInput} ${styles.focused}`
            : styles.trialInput
        }
        value={`${input}|`}
        placeholder={
          keyboardLayout.id === "mobile"
            ? "Tap on the virtual keyboard to start"
            : "Tap on your keyboard to start"
        }
        readOnly
      />
      <WordHelper
        mainSuggestionPosition={
          keyboardLayout.id === "physical"
            ? 0
            : Math.floor(totalSuggestions / 2)
        }
        totalSuggestions={totalSuggestions}
        focusedSuggestion={
          focusTarget.startsWith("suggestion-")
            ? +focusTarget.slice("suggestion-".length)
            : null
        }
        suggestions={suggestions}
        selectionStart={selection => {
          if (pressedKeys.length === 0) {
            actionScheduler.start(`suggestion-${selection}`, {
              type: Actions.inputSuggestion,
              word: selection
            });
          }
        }}
        selectionEnd={selection => {
          actionScheduler.end(`suggestion-${selection}`);
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
      {isCorrect ? <WorkflowButton onClick={onFinishTrial} /> : null}
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
