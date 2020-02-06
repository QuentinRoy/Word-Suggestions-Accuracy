import { useReducer, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Actions,
  ActionStatuses,
  KeyboardLayoutNames,
  SuggestionTypes,
  FocusTargetTypes
} from "../../utils/constants";
import "react-simple-keyboard/build/css/index.css";
import useActionScheduler from "./useActionScheduler";
import defaultGetEventLog from "../getEventLog";
import defaultGetTrialLog from "../getTrialLog";
import {
  isTargetCompleted,
  getTextFromSksDistribution,
  isInputCorrect
} from "../input";

import useWindowFocus from "./useWindowFocus";
import useFirstRenderTime from "./useFirstRenderTime";
import TrialReducer from "../trialReducers/TrialReducer";
import { useWordSuggestionsEngine } from "../wordSuggestions/wordSuggestionsContext";
import {
  isFullScreen,
  listenToFullScreenChange,
  stopListeningToFullScreenChange
} from "../../utils/fullScreen";

// **********
//  CONSTANTS
// **********

// This actions won't be logged.
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

const defaultControlInversionReducer = (state, action) => action.changes;

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
  reducer: controlInversionReducer = defaultControlInversionReducer
}) => {
  const wordSuggestionEngine = useWordSuggestionsEngine();

  // Returns a new state based on an action.
  // This expects the following action property: type (one of Actions), and
  // reductionStartTime (automatically inserted by the dispatchWrapper below).
  // We use useMemo. Otherwise it will change on each render and react will call
  // it twice. It is not usually a problem, but our reducer is very expensive.
  const reducer = useMemo(
    () =>
      TrialReducer({
        suggestionsType,
        totalSuggestions,
        wordSuggestionEngine,
        sksDistribution,
        getEventLog,
        controlInversionReducer
      }),
    [
      controlInversionReducer,
      wordSuggestionEngine,
      getEventLog,
      sksDistribution,
      suggestionsType,
      totalSuggestions
    ]
  );

  // Compute the initial state.
  const initState = () =>
    reducer(
      {
        events: [],
        layoutName: KeyboardLayoutNames.default,
        input: "",
        keyStrokeDelay: initKeyStrokeDelay,
        focusTarget: { type: FocusTargetTypes.input },
        totalSuggestionTargets:
          suggestionsType === SuggestionTypes.bar ? totalSuggestions : 0,
        suggestions: [],
        isFocusAlertShown: !document.hasFocus(),
        isFullScreen: isFullScreen()
      },
      { type: Actions.init }
    );

  // Maps the state, reducer, and actions.
  const [
    {
      layoutName,
      input,
      suggestions,
      focusTarget,
      events,
      keyStrokeDelay,
      isFocusAlertShown,
      isFullScreen: isFullScreenState
    },
    dispatch
  ] = useReducer(reducer, null, initState);

  useWindowFocus({
    onBlur() {
      dispatch({ type: Actions.windowBlurred });
    },
    onFocus() {
      dispatch({ type: Actions.windowFocused });
    }
  });

  useEffect(() => {
    const handler = () => {
      dispatch({
        type: isFullScreen()
          ? Actions.fullScreenEntered
          : Actions.fullScreenLeft
      });
    };
    listenToFullScreenChange(handler);
    return () => {
      stopListeningToFullScreenChange(handler);
    };
  }, []);

  // Used to schedule action to be performed after a delay.
  const actionScheduler = useActionScheduler(dispatch, keyStrokeDelay);

  // Record the start date of the trial.
  const startTime = useFirstRenderTime();

  // Some useful variables.
  const text = getTextFromSksDistribution(sksDistribution);
  const isCompleted = isTargetCompleted(input, text);
  const hasErrors = !isInputCorrect(input, text);

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

  // This cannot be included in the reducer since it would make it impure.
  const dispatchWrapper = useCallback(
    action => {
      if (action.type === Actions.submit) {
        completeTrialRef.current();
      } else if (
        action.status == null ||
        (action.status === ActionStatuses.start &&
          (keyStrokeDelay === 0 || instantActions.includes(action.type)))
      ) {
        dispatch({ ...action, reductionStartTime: new Date() });
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
    isFocusAlertShown,
    isFullScreen: isFullScreenState
  };
};

export default useTrial;
