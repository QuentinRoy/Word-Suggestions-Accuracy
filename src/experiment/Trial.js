import React, { useState, useEffect, useRef } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import "react-simple-keyboard/build/css/index.css";
import "./Trial.css";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";
import calculateSuggestions from "./calculateSuggestions";
import logging from "./logging";
import useComputeSuggestions from "./useComputeSuggestions";

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
  text,
  keyboardLayout,
  onAdvanceWorkflow,
  onLog,
  thresholdPositions,
  taskDelay
}) => {
  const [layoutName, setLayoutName] = useState(keyboardLayout.layoutName);
  const [input, setInput] = useState("");

  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = React.createRef();

  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect =
    correctCharsCount === text.length && text.length === input.length;

  const [delayKeyDownTime, setDelayKeyDownTime] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const computeSuggestions = useComputeSuggestions();
  const eventList = useRef([
    {
      event: "start_up_event",
      added_input: null,
      removed_input: null,
      input: null,
      is_error: false,
      suggestion_1: null,
      suggestion_2: null,
      suggestion_3: null,
      suggestion_used: null,
      total_correct_characters: correctCharsCount,
      total_incorrect_characters: input.length - correctCharsCount,
      total_sentence_characters: text.length,
      time: new Date().toISOString()
    }
  ]);

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
    } = calculateSuggestions(
      newInput,
      text,
      thresholdPositions,
      totalSuggestions
    );
    const newSuggestions = computeSuggestions(
      inputLastWord,
      thresholdPositions[wordIndexInText].sks,
      wordFromText,
      totalSuggestions
    );
    setSuggestions(newSuggestions);
    setInput(newInput);
    logging(
      eventName,
      inputRemoved,
      button,
      text,
      newInput,
      newSuggestions,
      word,
      countSimilarChars(text, newInput),
      onLog,
      eventList
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
    } else {
      onKeyPress(event.key);
    }
  }

  function onChange() {
    if (keyboardLayout.id === "mobile") {
      Keyboard.keyboard.ref.setInput(input);
    }
  }

  const delayHandler = (e, keydown = true) => {
    if (keydown) {
      if (taskDelay === 0) {
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
        const delayEndTime = new Date();
        if (
          delayEndTime - delayKeyDownTime >= taskDelay &&
          delayKeyDownTime !== null
        ) {
          if (keyboardLayout.id === "physical") {
            physicalKeyboardHandler(e);
          } else {
            onKeyPress(e);
          }
        }
      }
    } else {
      setDelayKeyDownTime(null);
    }
  };

  return (
    <div
      onKeyDown={e => delayHandler(e)}
      onKeyUp={e => delayHandler(e, false)}
      role="button"
      tabIndex="-1"
      style={{ outline: "none" }}
    >
      <TextToType
        text={text}
        correctCharsCount={correctCharsCount}
        input={input}
      />
      <input
        className="trial-input"
        ref={inputRef}
        value={input}
        placeholder={
          keyboardLayout.id === "mobile"
            ? "Tap on the virtual keyboard to start"
            : "Tap on your keyboard to start"
        }
        onChange={onChange}
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
        suggestionHandler={suggestionHandler}
      />
      {keyboardLayout.id === "mobile" ? (
        <Keyboard
          ref={r => {
            Keyboard.keyboardRef = r;
          }}
          display={keyboardLayout.display}
          layout={keyboardLayout.layout}
          layoutName={layoutName}
          onKeyPress={delayHandler}
        />
      ) : null}
      <WorkflowButton
        isCorrect={isCorrect}
        onAdvanceWorkflow={onAdvanceWorkflow}
      />
    </div>
  );
};

Trial.propTypes = {
  text: PropTypes.string.isRequired,
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  thresholdPositions: PropTypes.arrayOf(PropTypes.object).isRequired,
  taskDelay: PropTypes.number.isRequired
};

export default Trial;
