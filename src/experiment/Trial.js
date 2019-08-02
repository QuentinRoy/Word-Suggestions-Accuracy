import React, { useState, useEffect, useRef, useReducer } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";
import getTrialLog from "./getTrialLog";
import { KeyboardLayoutNames } from "../utils/constants";
import { useDictionary } from "./useDictionary";
import computeSuggestions from "./computeSuggestions";
import { count } from "../utils/arrays";
import "react-simple-keyboard/build/css/index.css";
import "./Trial.css";

const ActionTypes = Object.freeze({
  inputCharStart: "INPUT_CHAR_START",
  inputCharCancel: "INPUT_CHAR_CANCEL",
  inputCharConfirmed: "INPUT_CHAR_CONFIRM",
  deleteCharStart: "DELETE_CHAR_START",
  deleteCharCancel: "DELETE_CHAR_CANCEL",
  deleteCharConfirmed: "DELETE_CHAR_CONFIRMED",
  suggestionStart: "SUGGESTION_START",
  suggestionCancel: "SUGGESTION_CANCEL",
  suggestionConfirmed: "SUGGESTION_CONFIRM",
  focusNext: "FOCUS_NEXT",
  toggleShiftLayout: "TOGGLE_SHIFT_LAYOUT",
  toggleNumberLayout: "TOGGLE_NUMBER_LAYOUT"
});

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
  words,
  id,
  targetAccuracy,
  weightedAccuracy,
  sdAccuracy
}) => {
  const dictionary = useDictionary();

  // Returns a new state with the suggestions filled in based on the input.
  const stateSuggestionsReducer = state => {
    // This may produce empty words (""). This is OK.
    const inputWords = state.input.split(" ");
    // Note: if input ends with a space, then the input word is "". This is
    // on purpose.
    const currentInputWord =
      inputWords.length > 0 ? inputWords[inputWords.length - 1] : "";

    // Since inputWords may contain empty words, we only count the non empty
    // one.
    const totalInputWords = count(inputWords, w => w !== "");
    const currentWord = words[totalInputWords > 0 ? totalInputWords - 1 : 0];

    return {
      ...state,
      suggestions: computeSuggestions(
        currentInputWord,
        currentWord.sks,
        currentWord.word,
        totalSuggestions,
        dictionary
      )
    };
  };

  // Compute the initial state.
  const initState = () =>
    stateSuggestionsReducer({
      events: [],
      layoutName: keyboardLayout.layoutName,
      input: ""
    });

  // Returns a new state based on an action.
  const reducer = (state, action) => {
    const lastChar = state.input[state.input.length - 1];

    switch (action.type) {
      // -------------------------
      //  KEYBOARD LAYOUT ACTIONS
      // -------------------------
      case ActionTypes.toggleShiftLayout:
        return {
          ...state,
          layoutName:
            state.layoutName === KeyboardLayoutNames.shift
              ? KeyboardLayoutNames.default
              : KeyboardLayoutNames.shift
        };
      case ActionTypes.toggleNumberLayout:
        return {
          ...state,
          layoutName:
            state.layoutName === KeyboardLayoutNames.numbers
              ? KeyboardLayoutNames.default
              : KeyboardLayoutNames.numbers
        };

      // ------------------
      //  Character Inputs
      // ------------------
      case ActionTypes.inputCharConfirmed:
        return action.char === " " &&
          (lastChar === " " || state.input.length === 0)
          ? state
          : stateSuggestionsReducer({
              ...state,
              input: state.input + action.char,
              layoutName: KeyboardLayoutNames.default
            });

      case ActionTypes.deleteCharConfirmed:
        return stateSuggestionsReducer({
          ...state,
          input: state.input.slice(0, -1),
          layoutName: KeyboardLayoutNames.default
        });

      case ActionTypes.suggestionConfirmed: {
        let newInput;
        if (state.input.length === 0) {
          newInput = `${action.word} `;
        } else if (lastChar === " ") {
          newInput = `${state.input}${action.word} `;
        } else {
          const sentence = [
            ...state.input.split(" ").slice(0, -1),
            action.word
          ].join(" ");
          newInput = `${sentence} `;
        }
        return stateSuggestionsReducer({
          ...state,
          input: newInput,
          layoutName: KeyboardLayoutNames.default
        });
      }

      default:
        return state;
    }
  };

  const [{ layoutName, input, suggestions }, dispatch] = useReducer(
    reducer,
    null,
    initState
  );
  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = React.createRef();
  const trialStartTime = useRef(new Date());

  const text = words.map(w => w.word).join(" ");
  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect = text === input.trim();

  useEffect(() => {
    if (focusIndex === 0) {
      inputRef.current.focus();
    }
  }, [focusIndex, inputRef]);

  function onKeyPress(key) {
    switch (key) {
      case "{shift}":
      case "{lock}":
        dispatch({ type: ActionTypes.toggleShiftLayout });
        break;
      case "{bksp}":
        dispatch({ type: ActionTypes.deleteCharConfirmed });
        break;
      case "{numbers}":
      case "{abc}":
        dispatch({ type: ActionTypes.toggleNumberLayout });
        break;
      case "{space}":
        dispatch({ type: ActionTypes.inputCharConfirmed, char: " " });
        break;
      default:
        if (key.length === 1) {
          dispatch({ type: ActionTypes.inputCharConfirmed, char: key });
        }
    }
  }

  function onPhysicalKeyPress(event) {
    if (keyboardLayout.id !== "physical") {
      event.preventDefault();
      return;
    }
    switch (event.key) {
      case "Backspace":
        onKeyPress("{bksp}");
        break;
      case "Tab":
        event.preventDefault();
        setFocusIndex((focusIndex + 1) % (totalSuggestions + 1));
        break;
      default:
        onKeyPress(event.key);
    }
  }

  return (
    <div
      onKeyDown={onPhysicalKeyPress}
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
        selectionStart={selection =>
          dispatch({ type: ActionTypes.suggestionConfirmed, word: selection })
        }
        selectionEnd={() => {}}
      />
      {keyboardLayout.id === "mobile" ? (
        <Keyboard
          display={keyboardLayout.display}
          layout={keyboardLayout.layout}
          layoutName={layoutName}
          onKeyPress={onKeyPress}
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
  words: PropTypes.arrayOf(
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
