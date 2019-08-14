import { useReducer, useEffect, useRef } from "react";
import {
  Actions,
  FocusTargets,
  ActionStatuses,
  KeyboardLayoutNames
} from "../../utils/constants";
import { useDictionary } from "./useDictionary";
import getSuggestions from "../getSuggestions";
import "react-simple-keyboard/build/css/index.css";
import useActionScheduler from "./useActionScheduler";
import defaultGetEventLog from "../getEventLog";
import { trimEnd } from "../../utils/strings";
import defaultGetTrialLog from "../getTrialLog";

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

const focusTargets = Object.values(FocusTargets);
export const subFocusReducer = (state, action) => {
  switch (action.type) {
    case Actions.moveFocusTarget: {
      let focusIndex =
        (focusTargets.indexOf(state.focusTarget) + action.direction) %
        focusTargets.length;
      if (focusIndex < 0) focusIndex = focusTargets.length + focusIndex;
      return { ...state, focusTarget: focusTargets[focusIndex] };
    }
    case Actions.inputSuggestion:
      return { ...state, focusTarget: FocusTargets.input };
    case Actions.windowBlurred:
      return { ...state, focusTarget: null };
    case Actions.windowFocused:
      return { ...state, focusTarget: FocusTargets.input };
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
  sksDistribution,
  keyStrokeDelay,
  onComplete,
  totalSuggestions,
  id,
  targetAccuracy,
  weightedAccuracy,
  sdAccuracy,
  onLog,
  getEventLog = defaultGetEventLog,
  getTrialLog = defaultGetTrialLog
}) => {
  const dictionary = useDictionary();
  const getSuggestionsFromInput = input => {
    return getSuggestions(totalSuggestions, dictionary, sksDistribution, input);
  };

  // Compute the initial state.
  const initState = () => ({
    events: [],
    layoutName: KeyboardLayoutNames.default,
    input: "",
    focusTarget: FocusTargets.input,
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
    { layoutName, input, suggestions, focusTarget, events },
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
  const text = sksDistribution.map(w => w.word).join(" ");
  const isCompleted = text === trimEnd(input);

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
      actionScheduler.endAll();
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
    input
  };
};

export default useTrial;
