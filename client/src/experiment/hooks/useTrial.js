import { useReducer, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Actions,
  ActionStatuses,
  KeyboardLayoutNames,
  SuggestionTypes,
  FocusTargetTypes,
} from "../../common/constants";
import "react-simple-keyboard/build/css/index.css";
import useActionScheduler from "./useActionScheduler";
import defaultGetEventLog from "../getEventLog";
import defaultGetTrialLog from "../getTrialLog";
import {
  isTargetCompleted,
  getTextFromSksDistribution,
  isInputCorrect,
} from "../input";

import useWindowFocus from "./useWindowFocus";
import useFirstRenderTime from "./useFirstRenderTime";
import TrialReducer from "../trialReducers/TrialReducer";
import {
  useSuggestions,
  RequestCanceledError,
} from "../wordSuggestions/wordSuggestions";

// **********
//  CONSTANTS
// **********

// This actions won't be logged.
const instantActions = [
  Actions.moveFocusTarget,
  Actions.cancelAction,
  Actions.confirmAction,
  Actions.scheduleAction,
  Actions.submit,
  Actions.updateSuggestions,
];

// **********
//  Utils
// **********

const wait = (delay) =>
  new Promise((resolve) => {
    setTimeout(resolve, delay);
  });

const minDelay = (promise, delay) => {
  return Promise.all([promise, wait(delay)]).then(([res]) => res);
};

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
  minSuggestionsDelay,
  getEventLog = defaultGetEventLog,
  getTrialLog = defaultGetTrialLog,
  reducer: controlInversionReducer = defaultControlInversionReducer,
}) => {
  // Returns a new state based on an action.
  // This expects the following action property: type (one of Actions), and
  // reductionStartTime (automatically inserted by the dispatchWrapper below).
  // We use useMemo. Otherwise it will change on each render and react will call
  // it twice. It is not usually a problem, but our reducer may be expensive.
  const reducer = useMemo(
    () =>
      TrialReducer({
        suggestionsType,
        totalSuggestions,
        sksDistribution,
        getEventLog,
        controlInversionReducer,
      }),
    [
      controlInversionReducer,
      getEventLog,
      sksDistribution,
      suggestionsType,
      totalSuggestions,
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
      isFullScreen: isFullScreenState,
    },
    dispatch,
  ] = useReducer(reducer, null, initState);

  useWindowFocus({
    onBlur() {
      dispatch({ type: Actions.windowBlurred });
    },
    onFocus() {
      dispatch({ type: Actions.windowFocused });
    },
  });

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
    (action) => {
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

  // Check if the trial is still on going or not. This is used to ignore
  // non cancellable asynchronous operations, and avoid updating a finished
  // trial state.
  const isTrialFinishedRef = useRef(false);
  useEffect(() => {
    isTrialFinishedRef.current = false;
    return () => {
      isTrialFinishedRef.current = true;
    };
  }, []);

  const { requestSuggestions } = useSuggestions();
  const minSuggestionsDelayRef = useRef();
  minSuggestionsDelayRef.current = minSuggestionsDelay;

  // This is ugly, we would want to request the suggestions when receiving the
  // action instead of waiting for the next render... But it works good enough.
  useEffect(() => {
    if (totalSuggestions <= 0) return;
    const requestTime = new Date();
    minDelay(
      requestSuggestions({
        totalSuggestions,
        sksDistribution,
        input,
        canReplaceLetters: suggestionsType === SuggestionTypes.bar,
      }),
      minSuggestionsDelayRef.current
    ).then(
      (newSuggestions) => {
        // Check if the trial is finished first.
        if (isTrialFinishedRef.current) return;
        dispatchWrapper({
          requestInput: input,
          requestTime,
          responseTime: new Date(),
          type: Actions.updateSuggestions,
          suggestions: newSuggestions,
        });
      },
      (error) => {
        if (error instanceof RequestCanceledError) {
          // Requests may get canceled, and in this case fail. This is fine.
          // This catch handler is required to avoid unhandled rejected promises
          // errors.
          return;
        }
        throw error;
      }
    );
  }, [
    input,
    requestSuggestions,
    sksDistribution,
    suggestionsType,
    totalSuggestions,
    dispatchWrapper,
  ]);

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
    isFullScreen: isFullScreenState,
  };
};

export default useTrial;
