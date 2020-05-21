import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ControlServerLogin from "./ControlServerLogin";
import LogList from "./LogList";
import { ReadyStates } from "../common/constants";
import Area from "../common/components/Area";
import RemoteStartup from "./RemoteStartup";
import {
  useModeration,
  ModerationProvider,
} from "../common/moderation/Moderation";

function Alert(props) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function ConnectedRemoteModeration() {
  const { startApp, clients, clearLogs, logs } = useModeration();
  const [snack, setSnack] = useState({ isOpened: false });

  const handleSnackClose = () => {
    setSnack((s) => ({ ...s, isOpened: false }));
  };

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
        <RemoteStartup clients={clients ?? []} onStartApp={handleStartApp} />
      </Area>
      <Area maxHeight={500} width={500}>
        <LogList
          logs={logs ?? []}
          onClear={clearLogs}
          clients={clients ?? []}
        />
      </Area>
      <Snackbar open={snack.isOpened} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snack?.severity ?? "info"}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function RemoteModerationContent() {
  const moderation = useModeration();

  if (moderation.readyState !== ReadyStates.ready) {
    return (
      <Area>
        <h2>Login</h2>
        <ControlServerLogin />
      </Area>
    );
  }

  return <ConnectedRemoteModeration />;
}

export default function RemoteModeration() {
  return (
    <ModerationProvider>
      <RemoteModerationContent />
    </ModerationProvider>
  );
}
RemoteModeration.propTypes = {};
