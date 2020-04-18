import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import { ReadyStates, LogTypes } from "../constants";

export default function ResetDialog({
  open,
  onClose,
  moderationClient,
  activity,
}) {
  const notifyClient = (hasReset) => {
    if (moderationClient == null) {
      return Promise.resolve();
    }
    if (moderationClient.state === ReadyStates.ready) {
      return moderationClient.sendLog(LogTypes.resetDialog, {
        hasReset,
        activity,
      });
    }
    return Promise.reject(new Error(`No moderation client  not ready`));
  };

  const handleRestart = () => {
    localStorage.removeItem("state");
    // eslint-disable-next-line no-console
    notifyClient(true).catch(console.error);
    onClose(true);
  };

  const handleResume = () => {
    // eslint-disable-next-line no-console
    notifyClient(false).catch(console.error);
    onClose(false);
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Do you want to resume the experiment?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          If you restart the experiment, all unsaved data will be lost.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRestart} color="secondary">
          Restart experiment
        </Button>
        <Button onClick={handleResume} color="primary" autoFocus>
          Resume experiment
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ResetDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  moderationClient: PropTypes.shape({
    state: PropTypes.oneOf(Object.values(ReadyStates)).isRequired,
    sendLog: PropTypes.func.isRequired,
  }),
};

ResetDialog.defaultProps = {
  moderationClient: undefined,
};
