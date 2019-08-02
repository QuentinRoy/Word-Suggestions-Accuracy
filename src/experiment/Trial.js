import React, { useState, useEffect, useRef, useReducer } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import "react-simple-keyboard/build/css/index.css";
import "./Trial.css";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";
import calculateSuggestions from "./calculateSuggestions";
import getEventLog from "./getEventLog";
import useComputeSuggestions from "./useComputeSuggestions";
import getTrialLog from "./getTrialLog";
import { KeyboardLayoutNames } from "../utils/constants";

const ActionTypes = Object.freeze({
  inputCharStart: "INPUT_CHAR_START",
  inputCharCancel: "INPUT_CHAR_CANCEL",
  inputCharConfirmed: "INPUT_CHAR_CONFIRM",
  inputRecoStart: "INPUT_RECO_START",
  inputRecoCancel: "INPUT_RECO_CANCEL",
  inputRecoConfirmed: "INPUT_RECO_CONFIRM",
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
  const initState = () => ({
    layoutName: keyboardLayout.layoutName
  });

  const reducer = (state, action) => {
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
      default:
        return state;
    }
  };

  const [{ layoutName }, dispatch] = useReducer(reducer, null, initState);

  const text = words.map(w => w.word).join(" ");
  const [input, setInput] = useState("");

  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = React.createRef();

  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect =
    correctCharsCount === text.length && text.length === input.length;

  const [delayKeyDownTime, setDelayKeyDownTime] = useState(null);
  const [delayEndTime, setDelayEndTime] = useState(null);
  const [delayedInputChanged, setDelayedInputChanged] = useState(false);

  const computeSuggestions = useComputeSuggestions();
  const [suggestions, setSuggestions] = useState(
    computeSuggestions("", words[0].sks, text.split(" ")[0], totalSuggestions)
  );
  const eventList = useRef([
    {
      event: "start_up_event",
      addedInput: null,
      removedInput: null,
      input: null,
      isError: null,
      suggestion1: null,
      suggestion2: null,
      suggestion3: null,
      suggestionUsed: null,
      totalCorrectCharacters: correctCharsCount,
      totalIncorrectCharacters: input.length - correctCharsCount,
      totalSentenceCharacters: text.length,
      time: new Date().toISOString()
    }
  ]);
  const trialStartTime = useRef(new Date());

  const inputHasFocus = focusIndex === 0;
  useEffect(() => {
    if (inputHasFocus) {
      inputRef.current.focus();
    }
  }, [inputHasFocus, inputRef]);

  function onKeyPress(button, word = null, suggestedInput = null) {
    let eventName;
    let newInput = suggestedInput === null ? input : suggestedInput;
    let inputRemoved = null;

    if (button === "{shift}" || button === "{lock}") {
      dispatch({ type: ActionTypes.toggleShiftLayout });
      eventName = "shift_keyboard";
    } else if (button === "{numbers}" || button === "{abc}") {
      dispatch({ type: ActionTypes.toggleNumberLayout });
      eventName = "numToLet_keyboard";
    } else if (button === "{bksp}") {
      eventName = "remove_character";
      inputRemoved = input[input.length - 1];
      newInput = input.slice(0, -1);
    } else if (button === "{space}" && !isCorrect) {
      if (
        keyboardLayout.id === "mobile" &&
        input.charAt(input.length - 1) === " " &&
        button === "{space}"
      ) {
        newInput = `${input.slice(0, -1)}. `;
      } else {
        newInput = `${input} `;
      }
      eventName = "add_space";
    } else if (button === "{enter}") {
      eventName = focusIndex === 0 ? "add_enter" : "used_suggestion";
      setFocusIndex(0);
    } else if (button === "{tab}") {
      eventName = "focus_suggestion";
    } else if (!isCorrect) {
      if (input.charAt(input.length - 1) === " " && button === ".") {
        newInput = `${input.slice(0, -1) + button} `;
      } else {
        newInput = input + button;
      }
      eventName = "add_character";
    }

    const {
      inputLastWord,
      wordIndexInText,
      wordFromText
    } = calculateSuggestions(newInput, text, words, totalSuggestions);
    const newSuggestions = computeSuggestions(
      inputLastWord,
      words[wordIndexInText].sks,
      wordFromText,
      totalSuggestions
    );
    setSuggestions(newSuggestions);
    setInput(newInput);
    eventList.current.push(
      getEventLog(
        eventName,
        inputRemoved,
        button,
        text,
        newInput,
        newSuggestions,
        word,
        countSimilarChars(text, newInput)
      )
    );

    setDelayKeyDownTime(null);
  }

  const suggestionHandler = word => {
    if (word !== undefined && word !== "" && word !== null) {
      const i = input.lastIndexOf(" ");
      let suggestedInput = `${input.slice(0, i + 1) + word} `;
      if (i === text.lastIndexOf(" ")) {
        suggestedInput = suggestedInput.slice(0, -1);
      }
      setInput(suggestedInput);
      onKeyPress("{enter}", word, suggestedInput);
    }
  };

  function physicalKeyboardHandler(event) {
    if (event.key === "Backspace") onKeyPress("{bksp}");
    else if (event.keyCode === 16 || event.keyCode === 20) {
      onKeyPress("{shift}");
    } else if (event.keyCode === 9 && keyboardLayout.id === "physical") {
      event.preventDefault();
      setFocusIndex((focusIndex + 1) % (totalSuggestions + 1));
      onKeyPress("{tab}");
    } else if (event.key === "Enter") {
      if (focusIndex === 0) onKeyPress("{enter}");
    } else {
      onKeyPress(event.key);
    }
  }

  const delayHandler = (e, keydown = true, suggestion = null) => {
    if (keydown) {
      if (keyStrokeDelay === 0) {
        if (keyboardLayout.id === "physical") {
          physicalKeyboardHandler(e);
        } else {
          onKeyPress(e);
        }
      } else if (e.keyCode === 9) {
        physicalKeyboardHandler(e);
      } else {
        if (delayKeyDownTime === null) {
          setDelayKeyDownTime(new Date());
        }
        setDelayEndTime(new Date());
        if (
          delayEndTime - delayKeyDownTime >= keyStrokeDelay &&
          delayKeyDownTime !== null
        ) {
          if (suggestion !== null) {
            suggestionHandler(suggestion);
          } else if (keyboardLayout.id === "physical") {
            physicalKeyboardHandler(e);
          } else {
            onKeyPress(e);
          }
          setDelayEndTime(null);
          setDelayedInputChanged(true);
        }
      }
    } else {
      if (
        delayEndTime !== null &&
        (e.key !== "Tab" && e.key !== "Enter" && e.key !== "Shift") &&
        !delayedInputChanged
      ) {
        eventList.current.push(
          getEventLog(
            "failed_keystroke_for_delay",
            null,
            e.key,
            text,
            input,
            suggestions,
            null,
            countSimilarChars(text, input)
          )
        );
      }
      setDelayedInputChanged(false);
      setDelayKeyDownTime(null);
    }
  };

  return (
    <div
      onKeyDown={e => delayHandler(e)}
      onKeyUp={e => delayHandler(e, false)}
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
        delayHandler={delayHandler}
        keyStrokeDelay={keyStrokeDelay}
        suggestionHandler={suggestionHandler}
        keyboardLayout={keyboardLayout.id}
      />
      {keyboardLayout.id === "mobile" ? (
        <Keyboard
          display={keyboardLayout.display}
          layout={keyboardLayout.layout}
          layoutName={layoutName}
          onKeyPress={delayHandler}
        />
      ) : null}
      {isCorrect ? (
        <WorkflowButton
          onClick={() => {
            onLog("events", eventList.current);
            onLog(
              "log",
              getTrialLog(
                eventList.current, // eventList
                id, // id
                targetAccuracy, // targetAccuracy
                keyStrokeDelay, // delay
                weightedAccuracy, // weightedAccuracy
                sdAccuracy, // sdAccuracy
                words, // words
                trialStartTime.current, // trialStartTime
                new Date()
              )
            );
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
