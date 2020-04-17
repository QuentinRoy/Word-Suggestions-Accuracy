import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ControlServerLogin from "./ControlServerLogin";
import Logs from "./Logs";
import useModerationServer from "./useModerationServer";
import { LogInStates } from "../common/constants";
import Area from "../common/components/Area";
import RemoteStartup from "./RemoteStartup";

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function RemoteModeration() {
  const {
    loadingState,
    logInState,
    logIn,
    logs,
    clearLogs,
    clients,
    startApp,
  } = useModerationServer();
  const [snack, setSnack] = useState({ isOpened: false });

  const handleSnackClose = () => {
    setSnack({ ...snack, isOpened: false });
  };

  if (logInState === LogInStates.loggedIn) {
    const handleStartApp = (...args) => {
      startApp(...args).then(
        () =>
          setSnack({
            message: "App started",
            severity: "success",
            isOpened: true,
          }),
        (error) =>
          setSnack({
            message: error.message,
            severity: "error",
            isOpened: true,
          })
      );
    };
    return (
      <>
        <Area width={500}>
          <RemoteStartup clients={clients} onStartApp={handleStartApp} />
        </Area>
        <Area maxHeight={500} width={500}>
          <Logs logs={logs} onClear={clearLogs} />
        </Area>
        <Snackbar open={snack.isOpened} onClose={handleSnackClose}>
          <Alert
            onClose={handleSnackClose}
            severity={snack?.severity ?? "info"}
          >
            {snack?.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <Area>
      <h2>Login</h2>
      <ControlServerLogin
        onLogin={(...args) => logIn(...args)}
        serverState={loadingState}
      />
    </Area>
  );
}
RemoteModeration.propTypes = {};
