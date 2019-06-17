import React, { useState } from "react";
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

const Trial = ({ text }) => {
  const [layoutName, setLayout] = useState("default");
  const [input, setInput] = useState("");

  const correctCharsCount = countSimilarChars(text, input);

  function handleShift() {
    setLayout(layoutName === "default" ? "shift" : "default");
  }

  function onKeyPress(button) {
    if (button === "{shift}" || button === "{lock}") {
      handleShift();
    } else if (button === "{bksp}") {
      setInput(input.slice(0, -1));
    } else if (button === "{space}") {
      setInput(`${input} `);
    } else {
      setInput(input + button);
    }
  }

  function onChangeInput(event) {
    setInput(event.target.value);
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
      />
      <WordHelper
        input={input}
        text={text}
        setInput={setInput}
        countSimilarChars={countSimilarChars}
      />
      <Keyboard
        ref={r => {
          Keyboard.keyboardRef = r;
        }}
        layoutName={layoutName}
        onKeyPress={onKeyPress}
      />
    </div>
  );
};

Trial.propTypes = {
  text: PropTypes.string.isRequired
};

export default Trial;
