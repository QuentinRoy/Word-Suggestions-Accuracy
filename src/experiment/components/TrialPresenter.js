import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Actions,
  KeyboardLayoutNames,
  ActionStatuses,
  FocusTargetTypes,
  FocusTargets
} from "../../utils/constants";
import VirtualKeyboard from "../VirtualKeyboard";
import TrialInput from "./TrialInput";
import styles from "./styles/TrialPresenter.module.css";
import Banner from "./Banner";
import SuggestionsBar from "./SuggestionsBar";

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

/**
 * Create a distribution of suggestions indicating where the most relevant
 * suggestions should be positioned.
 *
 * @param {string[]} suggestions The suggestions
 * @param {number} mainPosition The position of the most relevant suggestion
 * @returns {Array<Number>} An array containing the index of the most relevant
 * positions (0 is the most relevant) and where they should be positioned.
 *
 * @example
 * createSuggestionDistribution(5, 0)  // returns [0, 1, 2, 3, 4]
 * createSuggestionDistribution(5, 4)  // returns [4, 3, 2, 1, 0]
 * createSuggestionDistribution(3, 1)  // returns [2, 0, 1]
 */
export const arrangeSuggestions = (suggestions, mainPosition) => {
  const dist = [];
  const n = suggestions.length;
  for (let i = 0; i < n; i += 1) {
    const suggestion = suggestions[i];
    const pos = i % 2 === 0 ? mainPosition - i / 2 : mainPosition + (i + 1) / 2;
    if (pos >= n) {
      dist.unshift(suggestion);
    } else if (pos < 0) {
      dist.push(suggestion);
    } else if (pos < mainPosition) {
      dist.unshift(suggestion);
    } else {
      dist.push(suggestion);
    }
  }
  return dist;
};

const TrialPresenter = ({
  dispatch,
  focusTarget,
  suggestions,
  text,
  input,
  keyboardLayoutName,
  isVirtualKeyboardEnabled,
  isSystemKeyboardEnabled,
  isCompleted,
  totalSuggestions,
  mainSuggestionPosition
}) => {
  // Using a reference for the pressed keys since we don't care about
  // re-rendering when it changes.
  const { current: pressedKeys } = useRef(new Set());
  const [isNoKeysPressed, setIsNoKeyPressed] = useState(true);

  const arrangedSuggestions = arrangeSuggestions(
    suggestions,
    mainSuggestionPosition
  );

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
          type: Actions.moveFocusTarget,
          direction: pressedKeys.has("Shift") ? -1 : 1,
          status
        });
        break;
      case "Enter":
        if (focusTarget === FocusTargets.input) {
          dispatch({ type: Actions.submit, status });
        } else if (
          focusTarget != null &&
          focusTarget.type === FocusTargetTypes.suggestion
        ) {
          dispatch({
            id: `suggestion-${focusTarget.suggestionNumber}`,
            type: Actions.inputSuggestion,
            word: arrangedSuggestions[focusTarget.suggestionNumber],
            status
          });
        }
        break;
      case "Backspace":
        if (focusTarget === FocusTargets.input) {
          dispatch({ type: Actions.deleteChar, status });
        }
        break;
      default:
        // Case the key is a character.
        if (key.length === 1 && focusTarget === FocusTargets.input) {
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
          isFocused={
            focusTarget != null && focusTarget.type === FocusTargetTypes.input
          }
          shouldCaretBlink={isNoKeysPressed}
        />
        {totalSuggestions > 1 ? (
          <SuggestionsBar
            totalSuggestions={totalSuggestions}
            focusedSuggestion={
              focusTarget != null &&
              focusTarget.type === FocusTargetTypes.suggestion
                ? focusTarget.suggestionNumber
                : null
            }
            suggestions={arrangedSuggestions}
            onSelectionStart={selection => {
              if (isNoKeysPressed) {
                dispatch({
                  type: Actions.inputSuggestion,
                  word: selection,
                  status: ActionStatuses.start
                });
              }
            }}
            onSelectionEnd={selection => {
              dispatch({
                type: Actions.inputSuggestion,
                word: selection,
                status: ActionStatuses.end
              });
            }}
          />
        ) : null}
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
  mainSuggestionPosition: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  focusTarget: PropTypes.shape({
    type: PropTypes.string.isRequired,
    suggestionNumber: PropTypes.number
  }),
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  text: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired,
  keyboardLayoutName: PropTypes.oneOf(Object.values(KeyboardLayoutNames)),
  isVirtualKeyboardEnabled: PropTypes.bool,
  isSystemKeyboardEnabled: PropTypes.bool,
  isCompleted: PropTypes.bool.isRequired,
  totalSuggestions: PropTypes.number.isRequired
};

TrialPresenter.defaultProps = {
  mainSuggestionPosition: 0,
  focusTarget: null,
  keyboardLayoutName: null,
  isVirtualKeyboardEnabled: false,
  isSystemKeyboardEnabled: true
};

export default TrialPresenter;
