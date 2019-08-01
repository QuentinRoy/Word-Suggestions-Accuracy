import { useEffect, useReducer } from "react";

export const States = Object.freeze({
  loading: "loading",
  loaded: "loaded",
  crashed: "crashed"
});

const ActionTypes = {
  loaded: "loaded",
  crashed: "crashed",
  start: "start"
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.loaded:
      return [States.loaded, action.data];
    case ActionTypes.crashed:
      return [States.crashed, null];
    case ActionTypes.start:
      return [States.loading, null];
    default:
      return state;
  }
};

const useJson = url => {
  const [state, dispatch] = useReducer(reducer, [States.loading, null]);

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
