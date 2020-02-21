import pipe from "lodash/fp/pipe";
import charReducer from "./charReducer";
import keyboardLayoutReducer from "./keyboardLayoutReducer";
import inputSuggestionReducer from "./inputSuggestionReducer";
import focusAlertReducer from "./focusAlertReducer";
import fullScreenReducer from "./fullScreenReducer";
import subFocusReducer from "./subFocusReducer";
import { Actions } from "../../utils/constants";
import EventReducer from "./EventsReducer";
import suggestionsReducer from "./suggestionsReducer";

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

const standardReducers = composeReducers(
  charReducer,
  keyboardLayoutReducer,
  inputSuggestionReducer,
  focusAlertReducer,
  subFocusReducer,
  suggestionsReducer,
  fullScreenReducer
);

export default function TrialReducer({
  sksDistribution,
  getEventLog,
  controlInversionReducer
}) {
  const eventReducer = EventReducer({ getEventLog, sksDistribution });

  const controlReducers = composeControlReducers(
    controlInversionReducer,
    eventReducer
  );

  const trialReducer = (originalState, action) => {
    // This reducer needs to be defined here because it triggers a recursion on
    // trialReducer.
    const confirmActionReducer =
      action.type === Actions.confirmAction
        ? s => trialReducer(s, action.action)
        : s => s;

    return pipe(
      // Standard reducer: consume a state and an action, and return a new state
      s => standardReducers(s, action),
      // Control reducers: consume the *original state*, and an action with
      // a changes property. Returns a new state too.
      s => controlReducers(originalState, { ...action, changes: s }),
      // The confirm action reducer must come at the end.
      confirmActionReducer
    )(originalState);
  };

  return trialReducer;
}
