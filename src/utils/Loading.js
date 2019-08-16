import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CircularProgress from "@material-ui/core/CircularProgress";
import classNames from "classnames";
import classes from "./Loading.module.css";

const Loading = ({ children, delay }) => {
  const [isShown, setIsShown] = useState(false);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsShown(true);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay]);
  return (
    <div
      className={classNames({
        [classes.main]: true,
        [classes.hidden]: !isShown
      })}
    >
      <CircularProgress />
      <div className={classes.label}>{children}</div>
    </div>
  );
};

Loading.propTypes = {
  children: PropTypes.node,
  delay: PropTypes.number
};

Loading.defaultProps = {
  children: "Loading...",
  delay: 1000
};

export default Loading;
