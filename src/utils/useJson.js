import { useEffect, useReducer } from "react";
import { LoadingStates } from "./constants";

const ActionTypes = {
  loaded: "loaded",
  crashed: "crashed",
  start: "start"
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.loaded:
      return [LoadingStates.loaded, action.data];
    case ActionTypes.crashed:
      return [LoadingStates.crashed, null];
    case ActionTypes.start:
      return [LoadingStates.loading, null];
    default:
      return state;
  }
};

const useJson = url => {
  const [state, dispatch] = useReducer(reducer, [LoadingStates.loading, null]);

  useEffect(() => {
    dispatch({ type: ActionTypes.start });
    let canceled = false;
    fetch(url)
      .then(resp => {
        if (canceled) throw new Error(`Request canceled`);
        if (resp.ok) return resp.json();
        throw new Error(`Cannot fetch ${url}`);
      })
      .then(jsonData => {
        if (!canceled) dispatch({ type: ActionTypes.loaded, data: jsonData });
      })
      .catch(() => {
        if (!canceled) dispatch({ type: ActionTypes.crashed });
      });
    return () => {
      canceled = true;
    };
  }, [url]);

  return state;
};

export default useJson;
