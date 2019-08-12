import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Actions,
  KeyboardLayoutNames,
  ActionStatuses
} from "../../utils/constants";
import VirtualKeyboard from "../VirtualKeyboard";
import TrialInput from "./TrialInput";
import styles from "./styles/TrialPresenter.module.css";
import Banner from "./Banner";

const mapVirtualKey = key => {
  switch (key) {
    case "{bksp}":
      return "Backspace";
    case "{tab}":
      return "Tab";
    case "{shift}":
      return "Shift";
    case "{lock}":
      return "CapsLock";
    case "{space}":
      return " ";
    default:
      return key;
  }
};

const TrialPresenter = ({
  dispatch,
  suggestion,
  text,
  input,
  keyboardLayoutName,
  isVirtualKeyboardEnabled,
  isSystemKeyboardEnabled,
  isCompleted
}) => {
  // Using a reference for the pressed keys since we don't care about
  // re-rendering when it changes.
  const { current: pressedKeys } = useRef(new Set());
  const [isNoKeysPressed, setIsNoKeyPressed] = useState(true);

  // Called when a key is being pressed down.Called multiple times
  // (for the same key) when the key is held down.
  function onKeyboardEvent(key, isDown) {
    if (isDown) {
      if (pressedKeys.has(key)) return;
      pressedKeys.add(key);
    } else {
      if (!pressedKeys.has(key)) return;
      pressedKeys.delete(key);
    }
    setIsNoKeyPressed(pressedKeys.size === 0);

    const status = isDown ? ActionStatuses.start : ActionStatuses.end;

    switch (key) {
      case "Shift":
        dispatch({
          id: "toggle-shift-layout",
          type: Actions.toggleLayout,
          layoutName: KeyboardLayoutNames.shift,
          status
        });
        break;
      case "{numbers}":
        dispatch({
          id: "toggle-number-layout",
          type: Actions.toggleLayout,
          layoutName: KeyboardLayoutNames.numbers,
          status
        });
        break;
      case "{abc}":
        dispatch({
          id: "toggle-default-layout",
          type: Actions.toggleLayout,
          layoutName: KeyboardLayoutNames.default,
          status
        });
        break;
      case "Tab":
        dispatch({
          type: Actions.inputSuggestion,
          id: `suggestion-used`,
          word: suggestion,
          status
        });
        break;
      case "Backspace":
        dispatch({ type: Actions.deleteChar, status });
        break;
      default:
        // Case the key is a character.
        if (key.length === 1) {
          dispatch({
            id: `input-${key}`,
            type: Actions.inputChar,
            status,
            char: key
          });
        }
    }
  }

  const onSystemKeyDown = event => {
    event.preventDefault();
    if (isSystemKeyboardEnabled) onKeyboardEvent(event.key, true);
  };

  const onSystemKeyUp = event => {
    event.preventDefault();
    if (isSystemKeyboardEnabled) onKeyboardEvent(event.key, false);
  };

  const onVirtualKeyDown = key => {
    onKeyboardEvent(mapVirtualKey(key), true);
  };

  const onVirtualKeyUp = key => {
    onKeyboardEvent(mapVirtualKey(key), false);
  };

  useEffect(() => {
    window.addEventListener("keydown", onSystemKeyDown);
    window.addEventListener("keyup", onSystemKeyUp);
    return () => {
      window.removeEventListener("keydown", onSystemKeyDown);
      window.removeEventListener("keyup", onSystemKeyUp);
    };
  });

  return (
    <div role="textbox" className={styles.trial}>
      <Banner text={text} input={input} isCorrect={isCompleted} />
      <div className={styles.content}>
        <TrialInput
          input={input}
          shouldCaretBlink={isNoKeysPressed}
          suggestion={suggestion}
        />
        {isVirtualKeyboardEnabled ? (
          <VirtualKeyboard
            layoutName={keyboardLayoutName}
            onKeyDown={onVirtualKeyDown}
            onKeyUp={onVirtualKeyUp}
          />
        ) : null}
      </div>
    </div>
  );
};

TrialPresenter.propTypes = {
  dispatch: PropTypes.func.isRequired,
  suggestion: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired,
  keyboardLayoutName: PropTypes.oneOf(Object.values(KeyboardLayoutNames)),
  isVirtualKeyboardEnabled: PropTypes.bool,
  isSystemKeyboardEnabled: PropTypes.bool,
  isCompleted: PropTypes.bool.isRequired
};

TrialPresenter.defaultProps = {
  keyboardLayoutName: null,
  isVirtualKeyboardEnabled: false,
  isSystemKeyboardEnabled: true
};

export default TrialPresenter;
