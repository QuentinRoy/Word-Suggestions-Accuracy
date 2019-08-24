import React from "react";
import { Typography } from "@material-ui/core";
import classes from "./styles/TrialHelp.module.css";

const TrialHelp = () => (
  <Typography component="div" variant="body2" className={classes.main}>
    <p>Use your keyboard to type the text at the top.</p>
    <p>
      You may have to hold each key pressed for a short period for it to take
      effect.
    </p>
    <p>
      Use <span className={classes.key}>tab</span> /{" "}
      <span className={classes.key}>&#8677;</span> to accept a suggestion.
    </p>
  </Typography>
);

export default TrialHelp;
