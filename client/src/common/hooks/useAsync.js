import { useEffect, useReducer } from "react";
import { ReadyStates } from "../constants";

const ActionTypes = {
  loaded: "loaded",
  crashed: "crashed",
  start: "start",
  stop: "stop",
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.loaded:
      return [ReadyStates.ready, action.data, null];
    case ActionTypes.crashed:
      return [ReadyStates.crashed, null, action.error];
    case ActionTypes.start:
      return [ReadyStates.loading, null, null];
    case ActionTypes.stop:
      return [ReadyStates.done, null, null];
    default:
      return state;
  }
};

const useAsync = (createPromise, deps = []) => {
  const [state, dispatch] = useReducer(reducer, [ReadyStates.idle, null]);

  // useEffect will create the promise. Most of the time this should only happen
  // once, event if createPromise changes. The deps argument may be used
  // to restart the async process if needed. In some ways, useAsync works a
  // a bit like use memo with a loading state.
  useEffect(() => {
    dispatch({ type: ActionTypes.start });
    let isCanceled = false;
    Promise.resolve()
      // Chaining createPromise from a resolved promise ensure that
      // if it throws, it will be caught by the catch block below.
      .then(createPromise)
      .then((result) => {
        if (isCanceled) throw new Error(`Request canceled`);
        dispatch({ type: ActionTypes.loaded, data: result });
      })
      .catch((error) => {
        if (!isCanceled) dispatch({ type: ActionTypes.crashed, error });
      });
    return () => {
      isCanceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
};

export default useAsync;
