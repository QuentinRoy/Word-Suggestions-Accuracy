import { useEffect, useReducer } from "react";
import { LoadingStates } from "./constants";

const ActionTypes = {
  loaded: "loaded",
  crashed: "crashed",
  start: "start",
  stop: "stop"
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.loaded:
      return [LoadingStates.loaded, action.data];
    case ActionTypes.crashed:
      return [LoadingStates.crashed, null];
    case ActionTypes.start:
      return [LoadingStates.loading, null];
    case ActionTypes.stop:
      return [LoadingStates.idle, null];
    default:
      return state;
  }
};

const useJson = url => {
  const [state, dispatch] = useReducer(reducer, [LoadingStates.idle, null]);

  useEffect(() => {
    if (url == null) {
      dispatch({ type: ActionTypes.stop });
      return () => {};
    }
    dispatch({ type: ActionTypes.start });
    let isCanceled = false;
    fetch(url)
      .then(resp => {
        if (isCanceled) throw new Error(`Request canceled`);
        if (resp.ok) return resp.json();
        throw new Error(`Cannot fetch ${url}`);
      })
      .then(jsonData => {
        if (!isCanceled) dispatch({ type: ActionTypes.loaded, data: jsonData });
      })
      .catch(() => {
        if (!isCanceled) dispatch({ type: ActionTypes.crashed });
      });
    return () => {
      isCanceled = true;
    };
  }, [url]);

  return state;
};

export default useJson;
