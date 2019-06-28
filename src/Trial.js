import React, { useState, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import "./Trial.css";
import WordHelper from "./WordHelper";
import TextToType from "./TextToType";
import WorkflowButton from "./WorkflowButton";

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
  const buttonRef1 = React.createRef();
  const buttonRef2 = React.createRef();
  const buttonRef3 = React.createRef();

  const correctCharsCount = countSimilarChars(text, input);
  const isCorrect = correctCharsCount === text.length;

  useEffect(() => {
    if (focusIndex === 0 && keyboardLayout.id === "physical") {
      inputRef.current.focus();
    }
  }, [focusIndex, inputRef, keyboardLayout.id]);

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
    } else if (event.keyCode === 9) {
      setFocusIndex((focusIndex + 1) % 4);
      if (keyboardLayout.id === "physical") {
        switch (focusIndex) {
          case 1:
            buttonRef1.current.focus();
            break;
          case 2:
            buttonRef2.current.focus();
            break;
          case 3:
            buttonRef3.current.focus();
            break;
          default:
            inputRef.current.focus();
        }
      }
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

  // gerer les differents cas du focus en fonction des ref ?
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
        ref={inputRef}
        value={input}
        placeholder={
          keyboardLayout.id === "mobile"
            ? "Tap on the virtual keyboard to start"
            : "Tap on your keyboard to start"
        }
        onChange={onChange}
        autoFocus={keyboardLayout.id === "physical"}
      />
      <WordHelper
        dictionary={dictionary}
        input={input}
        text={text}
        setInput={setInput}
        countSimilarChars={countSimilarChars}
        onLog={onLog}
        keyboardID={keyboardLayout.id}
        accuracy={accuracy}
        buttonRef1={buttonRef1}
        buttonRef2={buttonRef2}
        buttonRef3={buttonRef3}
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
