import React, { useRef, useReducer } from "react";
import PropTypes from "prop-types";
import getTrialLog from "../getTrialLog";
import {
  Actions,
  FocusTargets,
  ActionStatuses,
  KeyboardLayoutNames
} from "../../utils/constants";
import { useDictionary } from "../hooks/useDictionary";
import getSuggestion from "../getSuggestion";
import "react-simple-keyboard/build/css/index.css";
import useActionScheduler from "../hooks/useActionScheduler";
import trialReducer from "../hooks/trialReducer";
import getEventLog from "../getEventLog";
import { trimEnd } from "../../utils/strings";
import TrialPresenter from "./TrialPresenter";

// These actions won't be logged.
const noEventActions = [Actions.endAction, Actions.confirmAction];
const instantActions = [
  Actions.moveFocusTarget,
  Actions.cancelAction,
  Actions.confirmAction,
  Actions.scheduleAction,
  Actions.submit
];

const Trial = ({
  onAdvanceWorkflow,
  onLog,
  keyStrokeDelay,
  sksDistribution,
  id,
  targetAccuracy,
  weightedAccuracy,
  sdAccuracy
}) => {
  const dictionary = useDictionary();
  const getSuggestionFromInput = input =>
    getSuggestion(dictionary, sksDistribution, input);

  // Compute the initial state.
  const initState = () => ({
    events: [],
    layoutName: KeyboardLayoutNames.default,
    input: "",
    focusTarget: FocusTargets.input,
    suggestion: getSuggestionFromInput("")
  });
  // Returns a new state based on an action.
  const reducer = (state, action) => {
    let nextState = trialReducer(state, action);
    if (nextState.input !== state.input) {
      nextState = {
        ...nextState,
        suggestion: getSuggestionFromInput(nextState.input)
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
  // Matches the state, reducer, and actions.
  const [{ layoutName, input, suggestion, events }, dispatch] = useReducer(
    reducer,
    null,
    initState
  );

  // Used to schedule action to be performed after a delay.
  const actionScheduler = useActionScheduler(dispatch, keyStrokeDelay);

  // Record the start date of the trial.
  const { current: trialStartTime } = useRef(new Date());

  // Some useful constants
  const text = sksDistribution.map(w => w.word).join(" ");
  const isCompleted = text === trimEnd(input);

  // Called when the trial has been completed.
  function onSubmit() {
    if (!isCompleted) return;
    actionScheduler.endAll();
    onLog("events", events);
    const trialLog = getTrialLog(
      events,
      id,
      targetAccuracy,
      keyStrokeDelay,
      weightedAccuracy,
      sdAccuracy,
      sksDistribution,
      trialStartTime,
      new Date()
    );
    onLog("trial", trialLog);
    onAdvanceWorkflow();
  }

  const dispatchWrapper = action => {
    if (action.type === Actions.submit) {
      onSubmit();
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

  return (
    <TrialPresenter
      dispatch={dispatchWrapper}
      suggestion={suggestion}
      text={text}
      input={input}
      keyboardLayoutName={layoutName}
      isCompleted={isCompleted}
    />
  );
};

Trial.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  keyStrokeDelay: PropTypes.number.isRequired,
  sksDistribution: PropTypes.arrayOf(
    PropTypes.shape({
      word: PropTypes.string.isRequired,
      sks: PropTypes.number.isRequired
    })
  ).isRequired,
  targetAccuracy: PropTypes.number.isRequired,
  weightedAccuracy: PropTypes.number.isRequired,
  sdAccuracy: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired
};

export default Trial;
