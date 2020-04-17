import React, {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { ReadyStates } from "../../common/constants";
import WordSuggestionsEngine from "./WordSuggestionEngine";

const context = createContext();

const engineCreatedAction = Symbol("engine created");
const engineReadyAction = Symbol("engine ready");
const engineErrorAction = Symbol("engine error");
const engineStoppedAction = Symbol("engine stopped");

const initState = {
  loadingState: ReadyStates.idle,
  engine: null,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case engineCreatedAction:
      return {
        ...state,
        loadingState: ReadyStates.loading,
        engine: action.engine,
      };
    case engineReadyAction:
      return { ...state, loadingState: ReadyStates.ready };
    case engineErrorAction:
      return {
        ...state,
        loadingState: ReadyStates.crashed,
        error: action.error,
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
    if (serverAddress == null) return undefined;
    try {
      // This may throw, in particular if websockets are not supported
      const engine = WordSuggestionsEngine(serverAddress);

      dispatch({ type: engineCreatedAction, engine });

      const onOpen = () => dispatch({ type: engineReadyAction });
      const onError = (error) => dispatch({ type: engineErrorAction, error });

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
  serverAddress: PropTypes.string,
  children: PropTypes.node.isRequired,
};

WordSuggestionsProvider.defaultProps = { serverAddress: undefined };

export const useSuggestions = (onSuggestions) => {
  // Put the callback on a ref, to avoid constantly subscribing and
  // desubscribing in the use effect handler.
  const ref = useRef();
  ref.current = onSuggestions;

  const { loadingState, engine } = useContext(context);
  useEffect(() => {
    if (loadingState !== ReadyStates.ready) return undefined;
    const callback = (...args) => {
      if (ref.current != null) ref.current(...args);
    };
    engine.on("suggestions", callback);
    return () => engine.off("suggestions", callback);
  }, [engine, loadingState]);

  return {
    requestSuggestions:
      loadingState !== ReadyStates.ready
        ? () => {
            throw new Error(`Suggestion engine not ready`);
          }
        : engine.requestSuggestions,
    loadingState,
  };
};

// Re-export the erors from errors.
export * from "./errors";
