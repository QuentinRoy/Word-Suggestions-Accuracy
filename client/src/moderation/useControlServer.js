import { useEffect, useState } from "react";
import useWebsocket from "../common/hooks/useWebsocket";
import {
  MessageTypes,
  UserRoles,
  ReadyStates,
  LogInStates,
} from "../common/constants";
import useAsync from "../common/hooks/useAsync";
import getEndPoints from "../common/utils/endpoints";
import mergeReadyStates from "../common/utils/mergeReadyStates";

const useControlServer = () => {
  const [endPointsState, endpoints] = useAsync(getEndPoints);
  const [logInState, setLogInState] = useState(LogInStates.loggedOut);
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);

  const onMessage = (message) => {
    switch (message.type) {
      case MessageTypes.setClients:
        setClients(message.clients);
        break;
      case MessageTypes.setLogs:
        // Conditionally set logs to save one render.
        if (!(logs.length === 0 && message.logs.length === 0)) {
          setLogs(message.logs);
        }
        break;
      case MessageTypes.log:
        setLogs([...logs, message.log]);
        break;
      default:
        throw new Error(`Unexpected message: ${message.type}`);
    }
  };

  const [socketState, send] = useWebsocket(
    endPointsState === ReadyStates.ready ? endpoints.controlServer : null,
    { onMessage }
  );

  const loadingState = mergeReadyStates(socketState, endPointsState);

  // Handle server disconnection. We can only be logged in while the server
  // is loaded.
  useEffect(() => {
    if (
      loadingState !== ReadyStates.ready &&
      logInState !== LogInStates.loggedOut
    ) {
      setLogInState(LogInStates.loggedOut);
    }
  }, [loadingState, logInState]);

  const logIn = async (pass) => {
    if (loadingState !== ReadyStates.ready) {
      throw new Error(`The webserver is not ready`);
    }
    if (logInState !== LogInStates.loggedOut) {
      throw new Error(`Already logged in or logging in`);
    }
    setLogInState(LogInStates.loggingIn);
    return send({
      type: MessageTypes.register,
      role: UserRoles.moderator,
      pass,
    }).then(
      () => {
        setLogInState(LogInStates.loggedIn);
      },
      (err) => {
        setLogInState(LogInStates.loggedOut);
        throw err;
      }
    );
  };

  const startApp = (app, target, args) =>
    send({
      type: MessageTypes.command,
      target,
      command: "start-app",
      args: { ...args, app },
    });

  const clearLogs = () => {
    send({ type: MessageTypes.setLogs, logs: [] });
    setLogs([]);
  };

  return {
    loadingState,
    logInState,
    logIn,
    clients,
    logs,
    startApp,
    clearLogs,
  };
};

export default useControlServer;
