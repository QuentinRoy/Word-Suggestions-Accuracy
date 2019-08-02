import React, { useState, useEffect, useRef } from "react";
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

const Trial = ({ id, configData }) => {
  const text = configData.words.map(w => w.word).join(" ");
  const [layoutName, setLayoutName] = useState(
    configData.keyboardLayout.layoutName
  );
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
    computeSuggestions(
      "",
      configData.words[0].sks,
      text.split(" ")[0],
      totalSuggestions
    )
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

  function handleShift() {
    setLayoutName(layoutName === "default" ? "shift" : "default");
  }

  function handleNumbersOnMobile() {
    setLayoutName(layoutName === "default" ? "numbers" : "default");
  }

  function onKeyPress(button, word = null, suggestedInput = null) {
    let eventName;
    let newInput = suggestedInput === null ? input : suggestedInput;
    let inputRemoved = null;

    if (button === "{shift}" || button === "{lock}") {
      handleShift();
      eventName = "shift_keyboard";
    } else if (button === "{numbers}" || button === "{abc}") {
      handleNumbersOnMobile();
      eventName = "numToLet_keyboard";
    } else if (button === "{bksp}") {
      eventName = "remove_character";
      inputRemoved = input[input.length - 1];
      newInput = input.slice(0, -1);
    } else if (button === "{space}" && !isCorrect) {
      if (
        configData.keyboardLayout.id === "mobile" &&
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
    } = calculateSuggestions(
      newInput,
      text,
      configData.words,
      totalSuggestions
    );
    const newSuggestions = computeSuggestions(
      inputLastWord,
      configData.words[wordIndexInText].sks,
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
    } else if (
      event.keyCode === 9 &&
      configData.keyboardLayout.id === "physical"
    ) {
      event.preventDefault();
      setFocusIndex((focusIndex + 1) % (totalSuggestions + 1));
      onKeyPress("{tab}");
    } else if (event.key === "Enter") {
      if (focusIndex === 0) onKeyPress("{enter}");
    } else {
      onKeyPress(event.key);
    }
  }

  function onChange() {
    if (configData.keyboardLayout.id === "mobile") {
      Keyboard.keyboard.ref.setInput(input);
    }
  }

  const delayHandler = (e, keydown = true, suggestion = null) => {
    if (keydown) {
      if (configData.keyStrokeDelay === 0) {
        if (configData.keyboardLayout.id === "physical") {
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
          delayEndTime - delayKeyDownTime >= configData.keyStrokeDelay &&
          delayKeyDownTime !== null
        ) {
          if (suggestion !== null) {
            suggestionHandler(suggestion);
          } else if (configData.keyboardLayout.id === "physical") {
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
          configData.keyboardLayout.id === "mobile"
            ? "Tap on the virtual keyboard to start"
            : "Tap on your keyboard to start"
        }
        onChange={onChange}
        readOnly={configData.keyboardLayout.id === "mobile"}
      />
      <WordHelper
        mainSuggestionPosition={
          configData.keyboardLayout.id === "physical"
            ? 0
            : Math.floor(totalSuggestions / 2)
        }
        totalSuggestions={totalSuggestions}
        focusedSuggestion={focusIndex > 0 ? focusIndex - 1 : null}
        suggestions={suggestions}
        delayHandler={delayHandler}
        keyStrokeDelay={configData.keyStrokeDelay}
        suggestionHandler={suggestionHandler}
        keyboardLayout={configData.keyboardLayout.id}
      />
      {configData.keyboardLayout.id === "mobile" ? (
        <Keyboard
          ref={r => {
            Keyboard.keyboardRef = r;
          }}
          display={configData.keyboardLayout.display}
          layout={configData.keyboardLayout.layout}
          layoutName={layoutName}
          onKeyPress={delayHandler}
        />
      ) : null}
      {isCorrect ? (
        <WorkflowButton
          onClick={() => {
            configData.onLog("events", eventList.current);
            configData.onLog(
              "log",
              getTrialLog(
                eventList.current, // eventList
                id, // id
                configData.targetAccuracy, // targetAccuracy
                configData.keyStrokeDelay, // delay
                configData.weightedAccuracy, // weightedAccuracy
                configData.sdAccuracy, // sdAccuracy
                configData.words, // words
                trialStartTime.current, // trialStartTime
                new Date()
              )
            );
            configData.onAdvanceWorkflow();
          }}
        />
      ) : null}
    </div>
  );
};

Trial.propTypes = {
  configData: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.bool,
      PropTypes.func,
      PropTypes.object,
      PropTypes.array
    ])
  ).isRequired,
  id: PropTypes.string.isRequired
};

export default Trial;
