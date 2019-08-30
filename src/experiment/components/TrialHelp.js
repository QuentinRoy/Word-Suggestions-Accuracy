import React from "react";
import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import classes from "./styles/TrialHelp.module.css";

const TrialHelp = ({ isVirtualKeyboardEnabled }) => (
  <Typography component="div" variant="body2" className={classes.main}>
    <p>
      Use {isVirtualKeyboardEnabled ? "the virtual " : "your "} keyboard to type
      the text at the top.
    </p>
    <p>
      You may have to hold each key pressed for a short period for it to take
      effect.
    </p>
    <p>
      {isVirtualKeyboardEnabled ? (
        "Click one of the suggestions to accept it"
      ) : (
        <div>
          Use <span className={classes.key}>tab</span> /{" "}
          <span className={classes.key}>&#8677;</span> to accept a suggestion.
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
