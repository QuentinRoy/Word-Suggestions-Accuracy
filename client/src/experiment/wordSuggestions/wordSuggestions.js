import React, {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useRef
} from "react";
import PropTypes from "prop-types";
import { LoadingStates } from "../../utils/constants";
import WordSuggestionsEngine from "./WordSuggestionEngine";

const context = createContext();

const engineCreatedAction = Symbol("engine created");
const engineReadyAction = Symbol("engine ready");
const engineErrorAction = Symbol("engine error");
const engineStoppedAction = Symbol("engine stopped");

const initState = {
  loadingState: LoadingStates.idle,
  engine: null,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case engineCreatedAction:
      return {
        ...state,
        loadingState: LoadingStates.loading,
        engine: action.engine
      };
    case engineReadyAction:
      return { ...state, loadingState: LoadingStates.loaded };
    case engineErrorAction:
      return {
        ...state,
        loadingState: LoadingStates.crashed,
        error: action.error
      };
    case engineStoppedAction:
      return initState;
    default:
      return state;
  }
};

export const WordSuggestionsProvider = ({ serverAddress, children }) => {
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    try {
      // This may throw, in particular if websockets are not supported
      const engine = WordSuggestionsEngine(serverAddress);

      dispatch({ type: engineCreatedAction, engine });

      const onOpen = () => dispatch({ type: engineReadyAction });
      const onError = error => dispatch({ type: engineErrorAction, error });

      engine.on("open", onOpen);
      engine.on("error", onError);
      engine.on("close", onError);

      return () => {
        engine.off("open", onOpen);
        engine.off("error", onError);
        engine.off("close", onError);
        engine.close();
        dispatch({ type: engineStoppedAction });
      };
    } catch (e) {
      dispatch({ type: engineErrorAction, error: e });
      return () => dispatch({ type: engineStoppedAction });
    }
  }, [serverAddress]);

  return <context.Provider value={state}>{children}</context.Provider>;
};

WordSuggestionsProvider.propTypes = {
  serverAddress: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export const useSuggestions = onSuggestions => {
  // Put the callback on a ref, to avoid constantly subscribing and
  // desubscribing in the use effect handler.
  const ref = useRef();
  ref.current = onSuggestions;

  const { loadingState, engine } = useContext(context);
  useEffect(() => {
    if (loadingState !== LoadingStates.loaded) return undefined;
    const callback = (...args) => {
      if (ref.current != null) ref.current(...args);
    };
    engine.on("suggestions", callback);
    return () => engine.off("suggestions", callback);
  }, [engine, loadingState]);

  return {
    requestSuggestions:
      loadingState !== LoadingStates.loaded
        ? () => {
            throw new Error(`Suggestion engine not ready`);
          }
        : engine.requestSuggestions,
    loadingState
  };
};

// Re-export the erors from errors.
export * from "./errors";
