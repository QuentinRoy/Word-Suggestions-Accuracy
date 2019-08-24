import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react";
import PropTypes from "prop-types";

import {
  Actions,
  KeyboardLayoutNames,
  ActionStatuses,
  FocusTargetTypes,
  SuggestionTypes,
  TutorialSteps
} from "../../utils/constants";
import VirtualKeyboard from "../VirtualKeyboard";
import TrialInput from "./TrialInput";
import styles from "./styles/TrialPresenter.module.scss";
import SuccessBanner from "./SuccessBanner";
import Stimulus from "./Stimulus";
import SuggestionsBar from "./SuggestionsBar";
import TutorialOverlay from "./TutorialOverlay";
import FocusAlert from "./FocusAlert";
import useClientRect from "../hooks/useClientRect";
import TrialHelp from "./TrialHelp";

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
  isFocusAlertShown,
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
  mainSuggestionPosition,
  suggestionsType,
  hasErrors,
  tutorialStep,
  showsHelp
}) => {
  // Using a reference for the pressed keys since we don't care about
  // re-rendering when it changes.
  const { current: pressedKeys } = useRef(new Set());
  const [isNoKeyPressed, setIsNoKeyPressed] = useState(true);

  const arrangedSuggestions = useMemo(
    () => arrangeSuggestions(suggestions, mainSuggestionPosition),
    [suggestions, mainSuggestionPosition]
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
    const focusTargetType = focusTarget == null ? null : focusTarget.type;

    switch (key) {
      case "Shift":
        dispatch({
          id: "toggle-shift-layout",
          type: Actions.toggleKeyboardLayout,
          layoutName: KeyboardLayoutNames.shift,
          status
        });
        break;
      case "{numbers}":
        dispatch({
          id: "toggle-number-layout",
          type: Actions.toggleKeyboardLayout,
          layoutName: KeyboardLayoutNames.numbers,
          status
        });
        break;
      case "{abc}":
        dispatch({
          id: "toggle-default-layout",
          type: Actions.toggleKeyboardLayout,
          layoutName: KeyboardLayoutNames.default,
          status
        });
        break;
      case "Tab":
        if (
          suggestionsType === SuggestionTypes.inline &&
          arrangedSuggestions[mainSuggestionPosition] !== undefined &&
          !input.endsWith(arrangedSuggestions[mainSuggestionPosition].trim())
        ) {
          dispatch({
            type: Actions.inputSuggestion,
            id: `suggestion-${mainSuggestionPosition}`,
            word: arrangedSuggestions[mainSuggestionPosition],
            status
          });
        } else if (suggestionsType === SuggestionTypes.bar) {
          dispatch({
            type: Actions.moveFocusTarget,
            direction: pressedKeys.has("Shift") ? -1 : 1,
            status
          });
        }
        break;
      case "Enter":
        if (focusTargetType === FocusTargetTypes.input && isDown) {
          dispatch({ type: Actions.submit, status });
        } else if (
          focusTargetType === FocusTargetTypes.suggestion &&
          arrangedSuggestions[focusTarget.suggestionNumber] !== undefined
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
        if (focusTargetType === FocusTargetTypes.input) {
          dispatch({ type: Actions.deleteChar, status });
        }
        break;
      default:
        // Case the key is a character.
        if (key.length === 1 && focusTargetType === FocusTargetTypes.input) {
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

  const [stimulusTextRect, stimulusTextRef] = useClientRect();
  const [inputRect, inputRef] = useClientRect();
  const [inlineSuggestionRect, inlineSuggestionRef] = useClientRect();
  const [suggestionsBarRect, suggestionsBarRef] = useClientRect();

  const onCloseFocusAlert = useCallback(() => {
    dispatch({ type: Actions.closeFocusAlert });
  }, [dispatch]);

  return (
    <div className={styles.trial}>
      <div className={styles.banner}>
        {isCompleted ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <SuccessBanner />
        ) : (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Stimulus
            text={text}
            input={input}
            stimulusTextRef={tutorialStep == null ? null : stimulusTextRef}
          />
        )}
      </div>
      <div className={styles.content}>
        <TrialInput
          suggestionRef={tutorialStep == null ? null : inlineSuggestionRef}
          ref={tutorialStep == null ? null : inputRef}
          hasErrors={hasErrors}
          input={input}
          isFocused={
            focusTarget != null &&
            !isFocusAlertShown &&
            focusTarget.type === FocusTargetTypes.input
          }
          text={text}
          shouldCaretBlink={isNoKeyPressed}
          suggestion={
            suggestionsType === SuggestionTypes.inline
              ? arrangedSuggestions[mainSuggestionPosition]
              : null
          }
        />
        {suggestionsType === SuggestionTypes.bar ? (
          <div ref={tutorialStep == null ? null : suggestionsBarRef}>
            <SuggestionsBar
              totalSuggestions={totalSuggestions}
              focusedSuggestion={
                focusTarget != null &&
                !isFocusAlertShown &&
                focusTarget.type === FocusTargetTypes.suggestion
                  ? focusTarget.suggestionNumber
                  : null
              }
              suggestions={arrangedSuggestions}
              onSelectionStart={selection => {
                if (isNoKeyPressed) {
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
          </div>
        ) : null}
        {isVirtualKeyboardEnabled ? (
          <VirtualKeyboard
            layoutName={keyboardLayoutName}
            onKeyDown={onVirtualKeyDown}
            onKeyUp={onVirtualKeyUp}
          />
        ) : null}
        {showsHelp && (
          <div className={styles.trialHelp}>
            <TrialHelp />
          </div>
        )}
      </div>
      <FocusAlert isShown={isFocusAlertShown} onClose={onCloseFocusAlert} />
      {tutorialStep && (
        <TutorialOverlay
          tutorialStep={tutorialStep}
          stimulusTextRect={stimulusTextRect}
          inputRect={inputRect}
          inlineSuggestionRect={inlineSuggestionRect}
          suggestionsBarRect={suggestionsBarRect}
          suggestionsType={suggestionsType}
        />
      )}
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
  totalSuggestions: PropTypes.number.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired,
  hasErrors: PropTypes.bool.isRequired,
  tutorialStep: PropTypes.oneOf(Object.values(TutorialSteps)),
  isFocusAlertShown: PropTypes.bool,
  showsHelp: PropTypes.bool
};

TrialPresenter.defaultProps = {
  mainSuggestionPosition: 0,
  focusTarget: null,
  keyboardLayoutName: null,
  isVirtualKeyboardEnabled: false,
  isSystemKeyboardEnabled: true,
  tutorialStep: null,
  isFocusAlertShown: false,
  showsHelp: true
};

export default TrialPresenter;
