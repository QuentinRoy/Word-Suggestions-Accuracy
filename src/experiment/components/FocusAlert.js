import React, { memo } from "react";
import PropTypes from "prop-types";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";

const FocusAlert = memo(({ isShown, onClose }) => (
  <Dialog
    open={isShown}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      Please try to stay focused
    </DialogTitle>
    <DialogContent>
      <DialogContentText component="div">
        <p>
          We understand remaining focused for a long period of time is
          difficult. However, the time is measured. Any interruption invalidates
          your data. For the success of this experiment, it is very important
          that you try not to interrupt the task in the middle.
        </p>
        <p>We are counting on you!</p>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary" autoFocus>
        Continue
      </Button>
    </DialogActions>
  </Dialog>
));

FocusAlert.propTypes = {
  isShown: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default FocusAlert;
