import React, { useState, useEffect, useRef } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import "react-simple-keyboard/build/css/index.css";
import "./Trial.css";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";
import calculateSuggestions from "./calculateSuggestions";
import Logging from "./Logging";
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
  isDelayOn
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
      button: null,
      is_error: false,
      suggestion_1: null,
      suggestion_2: null,
      suggestion_3: null,
      suggestion_used: null,
      input_when_suggestion_used: input,
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

  useEffect(() => {
    const {
      inputLastWord,
      wordIndexInText,
      wordFromText
    } = calculateSuggestions(input, text, thresholdPositions, totalSuggestions);
    setSuggestions(
      computeSuggestions(
        inputLastWord,
        thresholdPositions[wordIndexInText].sks,
        wordFromText,
        totalSuggestions
      )
    );
  }, [input, text, thresholdPositions, computeSuggestions]);

  function handleShift() {
    setLayoutName(layoutName === "default" ? "shift" : "default");
  }

  function handleNumbersOnMobile() {
    setLayoutName(layoutName === "default" ? "numbers" : "default");
  }

  const suggestionHandler = word => {
    if (word !== undefined && word !== "" && word !== null) {
      const i = input.lastIndexOf(" ");
      let newInput = `${input.slice(0, i + 1) + word} `;
      if (i === text.lastIndexOf(" ")) {
        newInput = newInput.slice(0, -1);
      }
      setInput(newInput);
      Logging(
        "used_suggestion",
        false,
        "{enter}",
        text,
        input,
        suggestions,
        word,
        correctCharsCount,
        onLog,
        eventList
      );
    }
  };

  function onKeyPress(button) {
    let eventName;
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
      setInput(input.slice(0, -1));
    } else if (button === "{space}" && !isCorrect) {
      if (
        keyboardLayout.id === "mobile" &&
        input.charAt(input.length - 1) === " " &&
        button === "{space}"
      ) {
        setInput(`${input.slice(0, -1)}. `);
      } else {
        setInput(`${input} `);
      }
      eventName = "add_space";
    } else if (button === "{enter}") {
      setFocusIndex(0);
      eventName = "add_enter";
    } else if (!isCorrect) {
      if (input.charAt(input.length - 1) === " " && button === ".") {
        setInput(`${input.slice(0, -1) + button} `);
      } else {
        setInput(input + button);
      }
      eventName = "add_character";
    }
    Logging(
      eventName,
      inputRemoved,
      button,
      text,
      input,
      suggestions,
      null,
      correctCharsCount,
      onLog,
      eventList
    );
  }

  function physicalKeyboardHandler(event) {
    if (event.keyCode === 8) onKeyPress("{bksp}");
    else if (event.keyCode === 16 || event.keyCode === 20) {
      onKeyPress("{shift}");
    } else if (
      (event.keyCode >= 48 && event.keyCode <= 90) ||
      event.keyCode === 32 ||
      (event.keyCode >= 186 && event.keyCode <= 192)
    ) {
      onKeyPress(event.key);
    } else if (event.keyCode === 9 && keyboardLayout.id === "physical") {
      event.preventDefault();
      setFocusIndex((focusIndex + 1) % (totalSuggestions + 1));
      Logging(
        "focus_suggestion",
        null,
        "{tab}",
        text,
        input,
        suggestions,
        null,
        correctCharsCount,
        onLog,
        eventList
      );
    } else if (event.keyCode === 13) {
      onKeyPress("{enter}");
    }
  }

  function onChange() {
    if (keyboardLayout.id === "mobile") {
      Keyboard.keyboard.ref.setInput(input);
    }
  }

  const delayHandler = e => {
    if (isDelayOn) {
      const delayKeyDownTimeLength = new Date();
      console.log(delayKeyDownTimeLength - delayKeyDownTime);
      if (delayKeyDownTimeLength - delayKeyDownTime >= 3000) {
        console.log("hey");
        physicalKeyboardHandler(e);
      }
      setDelayKeyDownTime(null);
    }
  };

  return (
    <div
      onKeyDown={e => {
        if (isDelayOn) {
          if (delayKeyDownTime === null) {
            setDelayKeyDownTime(new Date());
          }
        } else {
          physicalKeyboardHandler(e);
        }
      }}
      onKeyUp={e => (isDelayOn ? delayHandler(e) : null)}
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
          onKeyPress={onKeyPress}
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
  isDelayOn: PropTypes.bool
};

Trial.defaultProps = {
  isDelayOn: false
};

export default Trial;
