import { useReducer, useRef, useCallback } from "react";
import pipe from "lodash/fp/pipe";
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
import focusAlertReducer from "../trialReducers/focusAlertReducer";
import subFocusReducer from "../trialReducers/subFocusReducer";
import useWindowFocus from "./useWindowFocus";
import useFirstRenderTime from "./useFirstRenderTime";

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

// **********
//  Utils
// **********

// Consumes a list of reducers, and returns a new reducer that call each
// of these reducers, one after the other, providing the result of the previous
// one to the other.
const composeReducers = (...reducers) => (state, action) =>
  reducers.reduce((newState, reducer) => reducer(newState, action), state);

// Consumes a list of control reducers, and returns a new control reducer that
// call each of these reducers, one after the other, providing the result of the
// previous one to the changes property of the next one changes property of
// the action argument.
const composeControlReducers = (...reducers) => (state, action) =>
  reducers.reduce(
    (changes, reducer) => reducer(state, { ...action, changes }),
    action.changes
  );

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

  const suggestionsControlReducer = (state, action) => {
    if (suggestionsType === SuggestionTypes.none) {
      return [];
    }
    const suggestions = getSuggestions(
      suggestionsType === SuggestionTypes.inline ? 1 : totalSuggestions,
      dictionary,
      sksDistribution,
      action.changes.input,
      suggestionsType === SuggestionTypes.bar
    );
    return { ...action.changes, suggestions };
  };

  const eventReducer = (originalState, action) => {
    if (noEventActions.includes(action.type)) return action.changes;
    return {
      ...action.changes,
      events: [
        ...action.changes.events,
        getEventLog(
          originalState,
          action,
          action.changes,
          { sksDistribution },
          action.reductionStartTime
        )
      ]
    };
  };

  // Returns a new state based on an action.
  // This expects the following action property: type (one of Actions), and
  // reductionStartTime (automatically inserted by the dispatchWrapper below).
  const reducer = (originalState, action) => {
    const standardReducers = composeReducers(
      charReducer,
      keyboardLayoutReducer,
      inputSuggestionReducer,
      focusAlertReducer,
      subFocusReducer
    );
    const controlReducers = composeControlReducers(
      suggestionsControlReducer,
      controlInversionReducer,
      eventReducer
    );
    // This reducer needs to be defined here because it triggers a recursion on
    // reducer.
    const confirmActionReducer =
      action.type === Actions.confirmAction
        ? s => reducer(s, action.action)
        : s => s;
    return pipe(
      // Standard reducer: consume a state and an action, and return a new state
      s => standardReducers(s, action),
      // Control reducers: consume the *original state*, and an action with
      // a changes property. Returns a new state too.
      changes => controlReducers(originalState, { ...action, changes }),
      // The confirm action reducer must come at the end.
      confirmActionReducer
    )(originalState);
  };

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
        isFocusAlertShown: !document.hasFocus()
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
      isFocusAlertShown
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
    isFocusAlertShown
  };
};

export default useTrial;
