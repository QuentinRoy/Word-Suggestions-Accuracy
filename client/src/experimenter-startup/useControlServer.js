import { useEffect, useState } from "react";
import useWebsocket from "../common/hooks/useWebsocket";
import { MessageTypes, UserRoles, LoadingStates } from "../common/constants";

export const LogInStates = Object.freeze({
  loggedIn: "LOGGED_IN",
  loggingIn: "LOGGING_IN",
  loggedOut: "LOGGED_OUT",
});

const useControlServer = (url) => {
  const [logInState, setLogInState] = useState(LogInStates.loggedOut);
  const [clients, setClients] = useState([]);

  const onMessage = (message) => {
    switch (message.type) {
      case MessageTypes.clientUpdate:
        setClients(message.clients);
        break;
      default:
        throw new Error(`Unexpected message: ${message.type}`);
    }
  };

  const [loadingState, send] = useWebsocket(url, { onMessage });

  // Handle server disconnection. We can only be logged in while the server
  // is loaded.
  useEffect(() => {
    if (
      loadingState !== LoadingStates.loaded &&
      logInState !== LogInStates.loggedOut
    ) {
      setLogInState(LogInStates.loggedOut);
    }
  }, [loadingState, logInState]);

  const logIn = async (pass) => {
    if (loadingState !== LoadingStates.loaded) {
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

  return { loadingState, logInState, logIn, clients, startApp };
};

export default useControlServer;
