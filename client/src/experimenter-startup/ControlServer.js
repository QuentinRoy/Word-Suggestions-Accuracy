import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ControlServerLogin from "./ControlServerLogin";
import ControlServerForm from "./ControlServerForm";
import useControlServer, { LogInStates } from "./useControlServer";

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ControlServer() {
  const {
    loadingState,
    logInState,
    logIn,
    clients,
    startApp,
  } = useControlServer();
  const [snack, setSnack] = useState({ isOpened: false });

  const handleSnackClose = () => {
    setSnack({ ...snack, isOpened: false });
  };

  if (logInState === LogInStates.loggedIn) {
    return (
      <>
        <h2>Remote Startup</h2>
        <ControlServerForm
          clients={clients}
          startApp={(...args) => {
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
          }}
        />
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
    <>
      <h2>Remote Startup</h2>
      <ControlServerLogin
        onLogin={(...args) => logIn(...args)}
        serverState={loadingState}
      />
    </>
  );
}
ControlServer.propTypes = {};
