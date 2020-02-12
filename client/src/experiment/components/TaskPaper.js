import React, { useLayoutEffect } from "react";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import classNames from "classnames";
import classes from "./styles/TaskPaper.module.css";

const backgroundColor = "#EEE";

const TaskPaper = ({ children, className }) => {
  useLayoutEffect(() => {
    const prevBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = backgroundColor;
    return () => {
      document.body.style.backgroundColor = prevBackgroundColor;
    };
  }, []);
  return (
    <div className={classNames(classes.paperWrapper, className)}>
      <Paper className={classes.paper}>{children}</Paper>
    </div>
  );
};

TaskPaper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

TaskPaper.defaultProps = { children: null, className: undefined };

export default TaskPaper;
