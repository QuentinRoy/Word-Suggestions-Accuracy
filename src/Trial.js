import React, { useState, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import "./Trial.css";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";

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

const Trial = ({ text, dictionary, keyboardLayout, onAdvanceWorkflow }) => {
  const [layoutName, setLayoutName] = useState(keyboardLayout.layoutName);
  const [input, setInput] = useState("");

  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect = correctCharsCount === text.length;

  useEffect(() => {
    setInput("");
  }, [text]);

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
    else if (button === "{bksp}") setInput(input.slice(0, -1));
    else if (button === "{space}") setInput(`${input} `);
    else if (button === "{enter}" || button === "{tab}")
      console.log("enter pressed");
    else if (!isCorrect) setInput(input + button);
  }

  function physicalKeyboardHandler(event) {
    if (event.keyCode === 8) onKeyPress("{bksp}");
    else if (event.keyCode === 16 || event.keyCode === 20) {
      onKeyPress("{shift}");
    } else if (
      (event.keyCode >= 48 && event.keyCode <= 90) ||
      event.keyCode === 32
    ) {
      onKeyPress(event.key);
    }
  }

  function onChangeInput(event) {
    Keyboard.keyboardRef.keyboard.setInput(input);
  }

  return (
    <div>
      <TextToType
        text={text}
        correctCharsCount={correctCharsCount}
        input={input}
      />
      <input
        value={input}
        placeholder="Tap on the virtual keyboard to start"
        onChange={onChangeInput}
        onKeyDown={physicalKeyboardHandler}
      />
      <WordHelper
        dictionary={dictionary}
        input={input}
        text={text}
        setInput={setInput}
        countSimilarChars={countSimilarChars}
      />
      <Keyboard
        ref={r => {
          Keyboard.keyboardRef = r;
        }}
        display={keyboardLayout.display}
        layout={keyboardLayout.layout}
        layoutName={layoutName}
        onKeyPress={onKeyPress}
      />
      <div className="advance-workflow-div">
        {isCorrect ? (
          <button
            type="button"
            onClick={onAdvanceWorkflow}
            className="advance-workflow-button"
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
};

Trial.propTypes = {
  text: PropTypes.string.isRequired,
  dictionary: PropTypes.arrayOf(PropTypes.string).isRequired,
  keyboardLayout: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.string])
  ).isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired
};

export default Trial;
