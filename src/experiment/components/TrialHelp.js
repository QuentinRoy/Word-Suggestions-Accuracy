import React from "react";
import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import classes from "./styles/TrialHelp.module.css";

const TrialHelp = ({ isVirtualKeyboardEnabled }) => (
  <Typography component="div" variant="body2" className={classes.main}>
    <p>Type the text at the top.</p>
    <p>
      {isVirtualKeyboardEnabled ? (
        "Tap a suggestion to accept it."
      ) : (
        <div>
          Use the keys <span className={classes.key}>1</span>,{" "}
          <span className={classes.key}>2</span>, or{" "}
          <span className={classes.key}>3</span> to accept the corresponding
          suggestion.
        </div>
      )}
    </p>
  </Typography>
);

TrialHelp.propTypes = {
  isVirtualKeyboardEnabled: PropTypes.bool
};

TrialHelp.defaultProps = {
  isVirtualKeyboardEnabled: false
};

export default TrialHelp;
