import React, {
  useRef,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import PropTypes from "prop-types";
import useWebsocket from "../hooks/useWebsocket";
import { MessageTypes, UserRoles, ReadyStates } from "../constants";
import useAsync from "../hooks/useAsync";
import getEndPoints from "../utils/endpoints";
import mergeReadyStates from "../utils/mergeReadyStates";
import Dispatcher from "../utils/Dispatcher";

const Actions = Object.freeze({
  registering: "REGISTERING",
  registered: "REGISTERED",
  unregistering: "UNREGISTERING",
  unregistered: "UNREGISTERED",
  error: "ERROR",
  clear: "CLEAR",
});

function reducer(state, action) {
  switch (action.type) {
    case Actions.registering:
    case Actions.unregistering:
      return { state: ReadyStates.loading };
    case Actions.registered:
      return {
        state: ReadyStates.ready,
        role: action.role,
        info: action.info,
      };
    case Actions.unregistered:
    case Actions.clear:
      return { state: ReadyStates.idle };
    case Actions.error:
      return {
        state: ReadyStates.crashed,
        error: action.error,
      };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

// This hook gives access to a non sharable moderation client.
export const useOneModerationClient = ({ onCommand } = {}) => {
  const [endPointsState, endpoints] = useAsync(getEndPoints);
  const [registration, dispatch] = useReducer(reducer, {
    state: ReadyStates.idle,
  });

  const onMessage = (message) => {
    switch (message.type) {
      case MessageTypes.command:
        return onCommand(message.command, message.args);
      default:
        throw new Error(`Received unexpected message: ${message.type}`);
    }
  };

  const [socketState, send, reconnect] = useWebsocket(
    endPointsState === ReadyStates.ready ? endpoints.controlServer : null,
    { onMessage }
  );

  const mergedState = mergeReadyStates(endPointsState, socketState);

  // Memoize these first because in practice they should almonst never change,
  // unlike the state.
  const register = useCallback(
    async (info) => {
      if (registration.state === ReadyStates.loading) {
        throw new Error(`Already registering`);
      }
      dispatch({ type: Actions.registering });
      try {
        await send({
          type: MessageTypes.register,
          role: UserRoles.participant,
          info,
        });
        dispatch({
          type: Actions.registered,
          role: UserRoles.participant,
          info,
        });
      } catch (error) {
        dispatch({ type: Actions.error, error });
        throw error;
      }
    },
    [registration.state, send]
  );

  const unregister = useCallback(async () => {
    if (registration.state === ReadyStates.loading) {
      throw new Error(`Already registering`);
    }
    dispatch({ type: Actions.unregistering });
    try {
      await send({ type: MessageTypes.unregister });
      dispatch({ type: Actions.unregistered });
    } catch (error) {
      dispatch({ type: Actions.error, error });
      throw error;
    }
  }, [registration.state, send]);

  const sendLog = useCallback(
    (type, content) => send({ type: MessageTypes.log, log: { type, content } }),
    [send]
  );

  useEffect(() => {
    if (
      socketState !== ReadyStates.ready &&
      registration.state === ReadyStates.ready
    ) {
      dispatch({ type: Actions.clear });
    }
  }, [socketState, registration.state]);

  return {
    state: mergedState,
    registration,
    register,
    unregister,
    sendLog,
    reconnect,
  };
};

const context = createContext();

export function ModerationClientProvider({ children }) {
  const dispatcherRef = useRef();
  if (dispatcherRef.current == null) {
    dispatcherRef.current = Dispatcher();
  }

  const moderationClient = useOneModerationClient({
    onCommand: dispatcherRef.current.dispatch,
  });

  return (
    <context.Provider
      value={{
        moderationClient,
        addCommandListener: dispatcherRef.current.on,
        removeCommandListener: dispatcherRef.current.off,
      }}
    >
      {children}
    </context.Provider>
  );
}
ModerationClientProvider.propTypes = { children: PropTypes.node };
ModerationClientProvider.defaultProps = { children: null };

export function useSharedModerationClient({ onCommand } = {}) {
  const {
    moderationClient,
    addCommandListener,
    removeCommandListener,
  } = useContext(context);

  const onCommandRef = useRef();
  onCommandRef.current = onCommand;

  useEffect(() => {
    const handleCommand = (...args) => {
      if (onCommandRef.current != null) {
        onCommandRef.current(...args);
      }
    };
    addCommandListener(handleCommand);
    return () => {
      removeCommandListener(handleCommand);
    };
  }, [addCommandListener, removeCommandListener]);

  return moderationClient;
}

export function useSharedRegisteredModerationClient({ onCommand, info } = {}) {
  const moderationClient = useSharedModerationClient({ onCommand });

  useEffect(() => {
    if (
      moderationClient.state === ReadyStates.ready &&
      moderationClient.registration.state === ReadyStates.idle
    ) {
      moderationClient.register(info);
    }
  }, [moderationClient, info]);

  return {
    ...moderationClient,
    state: mergeReadyStates(
      moderationClient.state,
      moderationClient.registration.state
    ),
    clientState: moderationClient.state,
  };
}
