import React, { memo, useState } from "react";
import PropTypes from "prop-types";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import { requestFullScreen } from "../../utils/fullScreen";

const FullScreenDialog = memo(({ isShown }) => {
  const [error, setError] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  return (
    <Dialog
      open={isShown}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        The app need to be in full screen to work properly
      </DialogTitle>
      <DialogContent>
        {error == null ? null : (
          <DialogContentText color="error">
            Error: {error.message}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isClicked}
          onClick={() => {
            setIsClicked(true);
            requestFullScreen()
              .catch(setError)
              .finally(() => {
                setIsClicked(false);
              });
          }}
          color="primary"
          autoFocus
        >
          Switch to full screen
        </Button>
      </DialogActions>
    </Dialog>
  );
});

FullScreenDialog.propTypes = {
  isShown: PropTypes.bool.isRequired
};

export default FullScreenDialog;
