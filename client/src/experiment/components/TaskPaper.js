import React from "react";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import classNames from "classnames";
import classes from "./styles/TaskPaper.module.css";
import useBodyBackgroundColor from "../hooks/useBodyBackgroundColor";

const TaskPaper = ({ children, className }) => {
  useBodyBackgroundColor("#EEE");
  return (
    <div className={classNames(classes.paperWrapper, className)}>
      <Paper className={classes.paper}>{children}</Paper>
    </div>
  );
};

TaskPaper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

TaskPaper.defaultProps = { children: null, className: undefined };

export default TaskPaper;
