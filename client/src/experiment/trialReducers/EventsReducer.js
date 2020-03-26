import { Actions } from "../../common/constants";

const defaultNoEventActions = [Actions.endAction, Actions.confirmAction];

export default function EventsReducer({
  getEventLog,
  sksDistribution,
  noEventActions = defaultNoEventActions,
}) {
  return function eventsReducer(originalState, action) {
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
        ),
      ],
    };
  };
}
