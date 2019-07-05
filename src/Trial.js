import React, { useState, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import "./Trial.css";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";

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
  dictionary,
  keyboardLayout,
  onAdvanceWorkflow,
  onLog,
  accuracy
}) => {
  const [layoutName, setLayoutName] = useState(keyboardLayout.layoutName);
  const [input, setInput] = useState("");

  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = React.createRef();

  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect = correctCharsCount === text.length;

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

  function onKeyPress(button) {
    if (button === "{shift}" || button === "{lock}") handleShift();
    else if (button === "{numbers}" || button === "{abc}")
      handleNumbersOnMobile();
    else if (button === "{bksp}") {
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
    } else if (button === "{enter}") {
      setFocusIndex(0);
    } else if (!isCorrect) {
      if (input.charAt(input.length - 1) === " " && button === ".") {
        setInput(`${input.slice(0, -1) + button} `);
      } else {
        setInput(input + button);
      }
    }
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
    } else if (event.keyCode === 13) {
      onKeyPress("{enter}");
    }
  }

  function onChange() {
    if (keyboardLayout.id === "mobile") {
      Keyboard.keyboard.ref.setInput(input);
    }
  }

  const divStyle = { outline: "none" };

  return (
    <div
      onKeyDown={physicalKeyboardHandler}
      role="button"
      tabIndex="-1"
      style={divStyle}
    >
      <TextToType
        text={text}
        correctCharsCount={correctCharsCount}
        input={input}
      />
      <input
        className="input"
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
        dictionary={dictionary}
        input={input}
        text={text}
        setInput={setInput}
        countSimilarChars={countSimilarChars}
        onLog={onLog}
        mainSuggestionPosition={
          keyboardLayout.id === "physical"
            ? 0
            : Math.floor(totalSuggestions / 2)
        }
        totalSuggestions={totalSuggestions}
        accuracy={accuracy}
        focusedSuggestion={focusIndex > 0 ? focusIndex - 1 : null}
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
  dictionary: PropTypes.arrayOf(PropTypes.string).isRequired,
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  accuracy: PropTypes.number.isRequired
};

export default Trial;
