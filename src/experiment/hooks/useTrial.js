import { useReducer, useEffect, useRef, useCallback } from "react";
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
import defaultGetTrialLog from "../getTrialLog";
import {
  isTargetCompleted,
  getTextFromSksDistribution,
  isInputCorrect
} from "../input";

import charReducer from "../trialReducers/charReducer";
import keyboardLayoutReducer from "../trialReducers/keyboardLayoutReducer";
import inputSuggestionReducer from "../trialReducers/inputSuggestionReducer";
import subFocusReducer from "../trialReducers/subFocusReducer";
import focusAlertReducer from "../trialReducers/focusAlertReducer";

// **********
//  REDUCERS
// **********

// Creates the main reducer, by applying each reducer one after the other.
const reducers = [
  charReducer,
  keyboardLayoutReducer,
  inputSuggestionReducer,
  subFocusReducer,
  focusAlertReducer
];

export const trialReducer = (state, action) =>
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
  totalKss,
  sdWordsKss,
  onLog,
  getEventLog = defaultGetEventLog,
  getTrialLog = defaultGetTrialLog,
  reducer: controlInversionReducer = (state, action) => action.changes
}) => {
  const dictionary = useDictionary();

  const getSuggestionsFromStates = newState => {
    if (suggestionsType === SuggestionTypes.none) {
      return [];
    }
    return getSuggestions(
      suggestionsType === SuggestionTypes.inline ? 1 : totalSuggestions,
      dictionary,
      sksDistribution,
      newState.input,
      suggestionsType === SuggestionTypes.bar
    );
  };

  // Compute the initial state.
  const initState = () => ({
    events: [],
    layoutName: KeyboardLayoutNames.default,
    input: "",
    keyStrokeDelay: initKeyStrokeDelay,
    focusTarget: { type: FocusTargetTypes.input },
    totalSuggestionTargets:
      suggestionsType === SuggestionTypes.bar ? totalSuggestions : 0,
    suggestions: getSuggestionsFromStates({ input: "" }, null),
    isFocusAlertShown: false
  });

  // Returns a new state based on an action.
  const reducer = (oldState, action) => {
    const actionStartTime = new Date();
    let nextState = trialReducer(oldState, action);
    if (nextState.input !== oldState.input) {
      nextState = {
        ...nextState,
        suggestions: getSuggestionsFromStates(nextState, oldState)
      };
    }
    nextState = controlInversionReducer(oldState, {
      ...action,
      changes: nextState
    });
    if (!noEventActions.includes(action.type)) {
      nextState = {
        ...nextState,
        events: [
          ...nextState.events,
          getEventLog(
            oldState,
            action,
            nextState,
            { sksDistribution },
            actionStartTime
          )
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
    {
      layoutName,
      input,
      suggestions,
      focusTarget,
      events,
      keyStrokeDelay,
      isFocusAlertShown
    },
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
  const isCompleted = isTargetCompleted(input, text);
  const hasErrors = !isInputCorrect(input, text);

  // Record the start date of the trial.
  const { current: startTime } = useRef(new Date());

  const completeTrial = () => {
    if (!isCompleted) return;
    onLog("events", events);
    const trialLog = getTrialLog(
      events,
      id,
      targetAccuracy,
      keyStrokeDelay,
      totalKss,
      sdWordsKss,
      sksDistribution,
      startTime,
      new Date()
    );
    onLog("trial", trialLog);
    onComplete();
  };

  // Put complete trial in a ref to avoid creating a new dispatchWrapper
  // every time it changes.
  const completeTrialRef = useRef(null);
  completeTrialRef.current = completeTrial;

  const dispatchWrapper = useCallback(
    action => {
      if (action.type === Actions.submit) {
        completeTrialRef.current();
      } else if (
        action.status == null ||
        (action.status === ActionStatuses.start &&
          (keyStrokeDelay === 0 || instantActions.includes(action.type)))
      ) {
        dispatch(action);
      } else if (action.status === ActionStatuses.start) {
        actionScheduler.endAll();
        actionScheduler.start(
          action.id != null ? action.id : action.type,
          action
        );
      } else {
        actionScheduler.end(
          action.id != null ? action.id : action.type,
          action
        );
      }
    },
    [actionScheduler, keyStrokeDelay]
  );

  return {
    text,
    keyboardLayoutName: layoutName,
    dispatch: dispatchWrapper,
    focusTarget,
    suggestions,
    isCompleted,
    input,
    hasErrors,
    isFocusAlertShown
  };
};

export default useTrial;
