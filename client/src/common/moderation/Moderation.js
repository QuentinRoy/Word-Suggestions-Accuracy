import * as React from "react";
import PropTypes from "prop-types";
import { useEffectReducer } from "use-effect-reducer";
import pick from "lodash/pick";
import ModerationClient, { Events } from "./ModerationClient";
import { ReadyStates } from "../constants";

const context = React.createContext();

const baseState = Object.freeze({
  readyState: ReadyStates.idle,
  connection: null,
  logs: null,
  clients: null,
  registration: null,
  error: null,
});

const reducer = (state, action, exec) => {
  switch (action.type) {
    case "start:client":
    case "reconnect:client": {
      const connection = action.connection ?? state.connection;
      if (connection == null) {
        if (state.connectionEffect != null) exec.stop(state.connectionEffect);
        return { ...baseState, readyState: ReadyStates.idle };
      }
      const effect = { type: "createClient", connection };
      return {
        ...baseState,
        readyState: ReadyStates.loading,
        connectionEffect:
          state.connectionEffect == null
            ? exec(effect)
            : exec.replace(state.connectionEffect, effect),
        connection,
      };
    }
    case "stop:client":
      exec.stop(state.connectionEffect);
      return {
        ...state,
        readyState: ReadyStates.done,
        logs: null,
        connectionEffect: null,
        clients: null,
        error: null,
      };
    case "client:started":
      return { ...state, client: action.client };
    case "client:ready-state:changed":
      return { ...state, readyState: action.readyState };
    case "client:clients:changed":
      return { ...state, clients: [...action.clients] };
    case "client:logs:changed":
      return { ...state, logs: [...action.logs] };
    case "client:registration:changed":
      return { ...state, registration: { ...action.registration } };
    case "client:error":
      return { ...state, error: action.error };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

function createClient(_, effect, dispatch) {
  if (effect.connection == null) return undefined;

  const client = ModerationClient(effect.connection);
  dispatch({ type: "client:started", client });

  const handleReadyStateChange = ({ readyState }) => {
    dispatch({ type: "client:ready-state:changed", readyState });
  };
  const handleClientsChange = ({ clients }) => {
    dispatch({ type: "client:clients:changed", clients });
  };
  const handleLogsChange = ({ logs }) => {
    dispatch({ type: "client:logs:changed", logs });
  };
  const handleRegistrationChange = ({ registration }) => {
    dispatch({ type: "client:registration:changed", registration });
  };
  const handleError = ({ error }) => {
    dispatch({ type: "client:error", error });
  };

  client.on(Events.readyStateChange, handleReadyStateChange);
  client.on(Events.error, handleError);
  client.on(Events.registrationChange, handleRegistrationChange);
  client.on(Events.clientsChange, handleClientsChange);
  client.on(Events.logsChange, handleLogsChange);

  return () => {
    client.off(Events.readyStateChange, handleReadyStateChange);
    client.off(Events.error, handleError);
    client.off(Events.registrationChange, handleRegistrationChange);
    client.off(Events.clientsChange, handleClientsChange);
    client.off(Events.logsChange, handleLogsChange);
    client.close();
  };
}

function useOneModeration({ onCommand, initConnection }) {
  const [state, dispatch] = useEffectReducer(
    reducer,
    {
      ...baseState,
      readyState:
        initConnection == null ? ReadyStates.idle : ReadyStates.loading,
      connection: initConnection,
    },
    { createClient }
  );

  React.useEffect(() => {
    dispatch({ type: "start:client" });
  }, [dispatch]);

  React.useEffect(() => {
    if (state.client == null) return undefined;
    state.client.onCommand = onCommand;
    return () => {
      state.client.onCommand = null;
    };
  });

  const reconnect = React.useCallback(() => {
    dispatch({ type: "reconnect:client", connection: state.connection });
  }, [dispatch, state.connection]);

  // Patch client with a reconnect method and the readyState, and remove
  // onCommand that we do not want to share.
  return React.useMemo(() => {
    return {
      ...pick(state.client, "startApp", "clearLogs", "sendLog"),
      reconnect,
      connection: state.connection,
      logs: state.logs,
      clients: state.clients,
      registration: state.registration,
      readyState: state.readyState,
      error: state.error,
    };
  }, [state, reconnect]);
}

export function ModerationProvider({ children, onCommand, initConnection }) {
  const moderation = useOneModeration({ onCommand, initConnection });
  return <context.Provider value={moderation}>{children}</context.Provider>;
}
ModerationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  onCommand: PropTypes.func,
  initConnection: PropTypes.shape({
    url: PropTypes.string.isRequired,
    role: PropTypes.string,
    info: PropTypes.shape(),
    pass: PropTypes.string,
  }),
};
ModerationProvider.defaultProps = {
  onCommand: undefined,
  initConnection: undefined,
};

export function useModeration() {
  return React.useContext(context);
}
