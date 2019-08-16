import { useReducer, useEffect, useRef } from "react";
import {
  Actions,
  ActionStatuses,
  KeyboardLayoutNames,
  SuggestionTypes,
  FocusTargetTypes
} from "../../utils/constants";
import { useDictionary } from "./useDictionary";
import getSuggestions from "../getSuggestions";
import "react-simple-keyboard/build/css/index.css";
import useActionScheduler from "./useActionScheduler";
import defaultGetEventLog from "../getEventLog";
import { trimEnd } from "../../utils/strings";
import defaultGetTrialLog from "../getTrialLog";
import { mod } from "../../utils/math";
import getTextFromSksDistribution from "../../utils/getTextFromSksDistribution";

// **********
//  REDUCERS
// **********

export const charReducer = (state, action) => {
  switch (action.type) {
    // Insert character.
    case Actions.inputChar:
      return { ...state, input: state.input + action.char };

    // Delete character.
    case Actions.deleteChar:
      if (state.input === "") return state;
      return { ...state, input: state.input.slice(0, -1) };

    default:
      return state;
  }
};

export const keyboardLayoutReducer = (state, action) => {
  switch (action.type) {
    // Go back to the default layout every time a character is inserted.
    case Actions.inputChar:
    case Actions.deleteChar:
    case Actions.inputSuggestion:
      return { ...state, layoutName: KeyboardLayoutNames.default };

    // Toggle the layout.
    case Actions.toggleKeyboardLayout:
      if (
        state.layoutName === KeyboardLayoutNames.default &&
        action.layoutName === KeyboardLayoutNames.default
      ) {
        return state;
      }
      if (state.layoutName === action.layoutName) {
        return {
          ...state,
          layoutName: KeyboardLayoutNames.default
        };
      }
      return { ...state, layoutName: action.layoutName };

    default:
      return state;
  }
};

const inputFocusTarget = Object.freeze({ type: FocusTargetTypes.input });
export const subFocusReducer = (state, action) => {
  switch (action.type) {
    case Actions.moveFocusTarget:
      if (
        state.focusTarget != null &&
        (state.focusTarget.type === FocusTargetTypes.input ||
          state.focusTarget.type === FocusTargetTypes.suggestion)
      ) {
        const currentFocusTargetIndex =
          state.focusTarget.type === FocusTargetTypes.input
            ? state.totalSuggestionTargets
            : state.focusTarget.suggestionNumber;
        const newFocusTargetIndex = mod(
          currentFocusTargetIndex + action.direction,
          state.totalSuggestionTargets + 1
        );
        const newFocusTarget =
          newFocusTargetIndex < state.totalSuggestionTargets
            ? {
                type: FocusTargetTypes.suggestion,
                suggestionNumber: newFocusTargetIndex
              }
            : inputFocusTarget;
        return { ...state, focusTarget: newFocusTarget };
      }
      return state;

    case Actions.inputSuggestion:
      return { ...state, focusTarget: inputFocusTarget };

    case Actions.windowBlurred:
      return { ...state, focusTarget: null };

    case Actions.windowFocused:
      return { ...state, focusTarget: inputFocusTarget };

    default:
      return state;
  }
};

export const inputSuggestionReducer = (state, action) => {
  if (action.type !== Actions.inputSuggestion) return state;
  const inputWithoutLastWord = state.input.slice(
    0,
    state.input.lastIndexOf(" ") + 1
  );
  return {
    ...state,
    input: `${inputWithoutLastWord}${action.word} `
  };
};

// Creates the main reducer, by applying each reducer one after the other.
const reducers = [
  charReducer,
  keyboardLayoutReducer,
  inputSuggestionReducer,
  subFocusReducer
];
const trialReducer = (state, action) =>
  reducers.reduce((newState, reducer) => reducer(newState, action), state);

// **********
//  CONSTANTS
// **********

// This actions won't be logged.
const noEventActions = [Actions.endAction, Actions.confirmAction];
const instantActions = [
  Actions.moveFocusTarget,
  Actions.cancelAction,
  Actions.confirmAction,
  Actions.scheduleAction,
  Actions.submit
];

// ******
//  HOOK
// ******

const useTrial = ({
  suggestionsType,
  sksDistribution,
  initKeyStrokeDelay,
  onComplete,
  totalSuggestions,
  id,
  targetAccuracy,
  weightedAccuracy,
  sdAccuracy,
  onLog,
  getEventLog = defaultGetEventLog,
  getTrialLog = defaultGetTrialLog,
  reducer: controlInversionReducer = (state, action) => action.change
}) => {
  const dictionary = useDictionary();
  const getSuggestionsFromInput =
    suggestionsType === SuggestionTypes.none
      ? () => []
      : input =>
          getSuggestions(
            suggestionsType === SuggestionTypes.inline ? 1 : totalSuggestions,
            dictionary,
            sksDistribution,
            input,
            suggestionsType === SuggestionTypes.bar
          );

  // Compute the initial state.
  const initState = () => ({
    events: [],
    layoutName: KeyboardLayoutNames.default,
    input: "",
    keyStrokeDelay: initKeyStrokeDelay,
    focusTarget: inputFocusTarget,
    totalSuggestionTargets:
      suggestionsType === SuggestionTypes.bar ? totalSuggestions : 0,
    suggestions: getSuggestionsFromInput("")
  });

  // Returns a new state based on an action.
  const reducer = (state, action) => {
    let nextState = trialReducer(state, action);
    if (nextState.input !== state.input) {
      nextState = {
        ...nextState,
        suggestions: getSuggestionsFromInput(nextState.input)
      };
    }
    nextState = controlInversionReducer(state, {
      ...action,
      changes: nextState
    });
    if (!noEventActions.includes(action.type)) {
      nextState = {
        ...nextState,
        events: [
          ...nextState.events,
          getEventLog(state, action, nextState, { sksDistribution })
        ]
      };
    }
    if (action.type === Actions.confirmAction) {
      nextState = reducer(nextState, action.action);
    }

    return nextState;
  };

  // Maps the state, reducer, and actions.
  const [
    { layoutName, input, suggestions, focusTarget, events, keyStrokeDelay },
    dispatch
  ] = useReducer(reducer, null, initState);

  // Used to schedule action to be performed after a delay.
  const actionScheduler = useActionScheduler(dispatch, keyStrokeDelay);

  // Monitor when the window is focused or blurred.
  useEffect(() => {
    const onWindowBlurred = () => {
      dispatch({ type: Actions.windowBlurred });
    };
    const onWindowFocused = () => {
      dispatch({ type: Actions.windowFocused });
    };
    window.addEventListener("blur", onWindowBlurred);
    window.addEventListener("focus", onWindowFocused);
    return () => {
      window.removeEventListener("blur", onWindowBlurred);
      window.removeEventListener("focus", onWindowFocused);
    };
  }, []);

  // Some useful variables.
  const text = getTextFromSksDistribution(sksDistribution);
  const isCompleted = text === trimEnd(input);
  const hasErrors = !isCompleted && !text.startsWith(input);

  // Record the start date of the trial.
  const { current: startTime } = useRef(new Date());

  const completeTrial = () => {
    onLog("events", events);
    const trialLog = getTrialLog(
      events,
      id,
      targetAccuracy,
      keyStrokeDelay,
      weightedAccuracy,
      sdAccuracy,
      sksDistribution,
      startTime,
      new Date()
    );
    onLog("trial", trialLog);
    onComplete();
  };

  const dispatchWrapper = action => {
    if (action.type === Actions.submit) {
      if (!isCompleted) return;
      completeTrial();
    } else if (
      action.status == null ||
      (action.status === ActionStatuses.start &&
        instantActions.includes(action.type))
    ) {
      dispatch(action);
    } else if (action.status === ActionStatuses.start) {
      actionScheduler.endAll();
      actionScheduler.start(
        action.id != null ? action.id : action.type,
        action
      );
    } else {
      actionScheduler.end(action.id != null ? action.id : action.type, action);
    }
  };

  return {
    text,
    keyboardLayoutName: layoutName,
    dispatch: dispatchWrapper,
    focusTarget,
    suggestions,
    isCompleted,
    input,
    hasErrors
  };
};

export default useTrial;
