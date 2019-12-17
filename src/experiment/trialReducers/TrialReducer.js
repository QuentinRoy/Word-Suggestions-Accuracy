import pipe from "lodash/fp/pipe";
import getSuggestions from "../getSuggestions";
import charReducer from "./charReducer";
import keyboardLayoutReducer from "./keyboardLayoutReducer";
import inputSuggestionReducer from "./inputSuggestionReducer";
import focusAlertReducer from "./focusAlertReducer";
import subFocusReducer from "./subFocusReducer";
import { SuggestionTypes, Actions } from "../../utils/constants";

const noEventActions = [Actions.endAction, Actions.confirmAction];

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

const SuggestionsControlReducer = ({
  suggestionsType,
  totalSuggestions,
  dictionary,
  sksDistribution
}) => (state, action) => {
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

const EventReducer = ({ getEventLog, sksDistribution }) => (
  originalState,
  action
) => {
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

export default function TrialReducer({
  suggestionsType,
  totalSuggestions,
  dictionary,
  sksDistribution,
  getEventLog,
  controlInversionReducer
}) {
  const suggestionsControlReducer = SuggestionsControlReducer({
    suggestionsType,
    totalSuggestions,
    dictionary,
    sksDistribution
  });

  const eventReducer = EventReducer({ getEventLog, sksDistribution });

  const trialReducer = (originalState, action) => {
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
        ? s => trialReducer(s, action.action)
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

  return trialReducer;
}
