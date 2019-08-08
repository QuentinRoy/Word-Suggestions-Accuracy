import React, { useRef, useReducer, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import SuggestionsBar from "./SuggestionsBar";
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
import TrialInput from "./TrialInput";
import Banner from "./Banner";
import { trimEnd } from "../utils/strings";

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
    hasDocFocus: document.hasFocus(),
    suggestions: getSuggestionsFromInput("")
  });
  // Returns a new state based on an action.
  const reducer = (state, action) => {
    let nextState = trialReducer(state, action);
    if (nextState.input !== state.input) {
      nextState = {
        ...nextState,
        suggestions: getSuggestionsFromInput(nextState.input)
      };
    }
    if (!noEventActions.includes(action.type)) {
      nextState = {
        ...nextState,
        events: [
          ...nextState.events,
          getEventLog(state, action, nextState, { sksDistribution })
        ]
      };
    }
    if (action.type === Actions.confirmAction) {
      nextState = reducer(nextState, action.action);
    }
    return nextState;
  };
  // Matches the state, reducer, and actions.
  const [
    {
      layoutName,
      input,
      suggestions,
      pressedKeys,
      focusTarget,
      events,
      hasDocFocus
    },
    dispatch
  ] = useReducer(reducer, null, initState);

  // Used to schedule action to be performed after a delay.
  const actionScheduler = useActionScheduler(dispatch, keyStrokeDelay);

  // A reference on the main dom element.
  const domRef = React.createRef();

  // Record the start date of the trial.
  const { current: trialStartTime } = useRef(new Date());

  // Some useful variables.
  const text = sksDistribution.map(w => w.word).join(" ");
  const isInputCorrect = text === trimEnd(input);
  const focusedSuggestion =
    hasDocFocus && focusTarget.startsWith("suggestion-")
      ? +focusTarget.slice("suggestion-".length)
      : null;

  // Called when the trial has been completed.
  function onTrialCompletion() {
    actionScheduler.endAll();
    onLog("events", events);
    const trialLog = getTrialLog(
      events,
      id,
      targetAccuracy,
      keyStrokeDelay,
      weightedAccuracy,
      sdAccuracy,
      sksDistribution,
      trialStartTime,
      new Date()
    );
    onLog("trial", trialLog);
    onAdvanceWorkflow();
  }

  // Called when a key is being pressed down.Called multiple times
  // (for the same key) when the key is held down.
  function onKeyDown(key) {
    if (pressedKeys.includes(key)) return;
    dispatch({ type: Actions.keyDown, key });
    switch (key) {
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
        if (pressedKeys.includes("Shift")) {
          dispatch({ type: Actions.previousFocusTarget });
        } else {
          dispatch({ type: Actions.nextFocusTarget });
        }
        break;
      case "Enter":
        if (focusTarget === "input" && isInputCorrect) {
          onTrialCompletion();
        } else if (focusedSuggestion != null) {
          actionScheduler.endAll();
          actionScheduler.start("suggestion", {
            type: Actions.inputSuggestion,
            word: suggestions[focusedSuggestion]
          });
        }
        break;
      case "Backspace":
        if (focusTarget === "input") {
          actionScheduler.endAll();
          actionScheduler.start(`key-${key}`, { type: Actions.deleteChar });
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

  // Called when a key is being released.
  function onKeyUp(key) {
    switch (key) {
      case "Shift":
      case "CapsLock":
      case "{numbers}":
      case "{abc}":
      case "Backspace":
        actionScheduler.end(`key-${key}`);
        break;
      case "Enter":
        actionScheduler.end("suggestion");
        break;
      default:
        if (key.length === 1) {
          actionScheduler.end(`char-${key}`);
        }
    }
    dispatch({ type: Actions.keyUp, key });
  }

  // Wraps the system keyboard events to be ignored if the target keyboard
  // is not "physical"
  function onSystemKeyUp(event) {
    event.preventDefault();
    if (keyboardLayout.id === "physical") onKeyUp(event.key);
  }

  function onSystemKeyDown(event) {
    event.preventDefault();
    if (keyboardLayout.id === "physical") onKeyDown(event.key);
  }

  function onDocBlurred() {
    dispatch({ type: Actions.docBlurred });
  }

  function onDocFocused() {
    dispatch({ type: Actions.docFocused });
  }

  useEffect(() => {
    window.addEventListener("keydown", onSystemKeyDown);
    window.addEventListener("keyup", onSystemKeyUp);
    window.addEventListener("blur", onDocBlurred);
    window.addEventListener("focus", onDocFocused);
    return () => {
      window.removeEventListener("keydown", onSystemKeyDown);
      window.removeEventListener("keyup", onSystemKeyUp);
      window.removeEventListener("blur", onDocBlurred);
      window.removeEventListener("focus", onDocFocused);
    };
  });

  return (
    <div role="textbox" className={styles.trial} ref={domRef}>
      <Banner text={text} input={input} isCorrect={isInputCorrect} />
      <div className={styles.content}>
        <TrialInput
          input={input}
          isFocused={hasDocFocus && focusTarget === "input"}
          shouldCaretBlink={pressedKeys.length === 0}
        />
        <SuggestionsBar
          mainSuggestionPosition={
            keyboardLayout.id === "physical"
              ? 0
              : Math.floor(totalSuggestions / 2)
          }
          totalSuggestions={totalSuggestions}
          focusedSuggestion={focusedSuggestion}
          suggestions={suggestions}
          onSelectionStart={selection => {
            if (pressedKeys.length === 0) {
              actionScheduler.start(`suggestion-${selection}`, {
                type: Actions.inputSuggestion,
                word: selection
              });
            }
          }}
          onSelectionEnd={selection => {
            actionScheduler.end(`suggestion-${selection}`);
          }}
        />
        {keyboardLayout.id === "mobile" ? (
          <Keyboard
            display={keyboardLayout.display}
            layout={keyboardLayout.layout}
            layoutName={layoutName}
            onKeyDown={key => onKeyDown(mapVirtualKey(key))}
            onKeyUp={key => onKeyUp(mapVirtualKey(key))}
          />
        ) : null}
      </div>
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
