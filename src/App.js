import "./App.css";
import React, { useState, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./index.css";
import WorldHelper from "./wordHelper";

const TEXT_ = "Here is";
const regExp = /[a-zA-Z0-9\s]/;

function App() {
  const [layoutName, setLayout] = useState("default");
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState("");
  const [incorrect, setIncorrect] = useState("");
  const [text, setText] = useState(TEXT_);
  const [winnerLabel, setWinnerLabel] = useState(" ");

  useEffect(
    () => {
      setWinnerLabel(correct === TEXT_ ? "You typed the text correctly!" : " ");
    },
    [correct]
  );

  function onKeyPress(button) {
    console.log("Button pressed", button);
    if (button === "{shift}" || button === "{lock}") {
      handleShift();
    } else if (button === "{bksp}") {
      const newIncorrect = incorrect.slice(0, -1);
      setIncorrect(newIncorrect);

      const newText = incorrect.charAt(incorrect.length - 1) + text;
      setText(newText);
    } else if (button === "{enter}") {
      // TODO ?
    } else {
      changeColorChar(button === "{space}" ? " " : button);
    }
  }

  function handleShift() {
    setLayout(layoutName === "default" ? "shift" : "default");
  }

  function onChangeInput(event) {
    setInput(event.target.value);
    Keyboard.keyboardRef.keyboard.setInput(input);
  }

  function changeColorChar(charTyped) {
    if (regExp.test(charTyped)) {
      if (charTyped === text.charAt(0)) {
        const newCorrect = correct + text.charAt(0);
        setCorrect(newCorrect);
      } else {
        const newIncorrect = incorrect + text.charAt(0);
        setIncorrect(newIncorrect);
      }
      const newText = text.slice(1);
      setText(newText);
    }
  }

  function handlePhysicalKeyboard(keyTyped) {
    if (keyTyped.keyCode === 8) {
      //bksp
      onKeyPress("{bksp}");
    } else if (keyTyped.keyCode === 16 || keyTyped.keyCode === 20) {
      //shift & caps lock
      onKeyPress("{shift}");
    } else if (
      (keyTyped.keyCode >= 48 && keyTyped.keyCode <= 90) ||
      keyTyped.keyCode === 32
    ) {
      onKeyPress(keyTyped.key);
    } else {
      console.log("Key not handled");
    }
  }

  function wordHelpHandler(word) {
    const i = input.lastIndexOf(" ");
    const newInput = input.slice(0, i + 1) + word;
    setInput({ newInput }, () => {
      console.log(input);
    });
    setCorrect(newInput);
    const newText = text.slice(i + word.length - input.length + 1);
    setText(newText);
    console.log("newInput", newInput);
    console.log("input", input);
  }

  return (
    <div>
      <h4>Text to type:</h4>
      <p id="winnerlabel">{winnerLabel}</p>
      <div id="textToType">
        <span className="correct">{correct}</span>
        <span className="incorrect">{incorrect}</span>
        <span className="text">{text}</span>
      </div>
      <input
        value={input}
        placeholder={"Tap on the virtual keyboard to start"}
        onChange={e => onChangeInput(e)}
        onKeyDown={keyTyped => handlePhysicalKeyboard(keyTyped)}
      />
      <WorldHelper wordHelpHandler={word => wordHelpHandler(word)} />
      <Keyboard
        ref={r => (Keyboard.keyboardRef = r)}
        layoutName={layoutName}
        onChange={input => setInput(input)}
        onKeyPress={button => onKeyPress(button)}
      />
    </div>
  );
}

export default App;
