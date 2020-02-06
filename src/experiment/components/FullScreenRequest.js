import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import TaskPaper from "./TaskPaper";
import styles from "./styles/FullScreenRequest.module.css";
import useIsFullScreen from "../hooks/useIsFullScreen";

export default function FullScreenRequest({ onFullScreen }) {
  const [error, setError] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const isFullScreen = useIsFullScreen();

  // This effect is useful when the app is already in full screen when
  // this component is rendered. It will immediately call `onFullScreen`.
  useEffect(() => {
    if (isFullScreen) {
      onFullScreen();
    }
  }, [isFullScreen, onFullScreen]);

  if (isFullScreen) {
    return <TaskPaper />;
  }
  return (
    <TaskPaper>
      <p>The app need to be in full screen to work properly.</p>
      <p>
        <Button
          variant="contained"
          color="primary"
          disabled={isClicked}
          onClick={() => {
            setIsClicked(true);
            document.documentElement
              .requestFullscreen()
              .then(onFullScreen, setError)
              .finally(() => {
                setIsClicked(false);
              });
          }}
        >
          Switch to full screen
        </Button>
      </p>
      {error == null ? null : (
        <p className={styles.error}>
          Something went wrong: &ldquo;{error.message}&rdquo;
        </p>
      )}
    </TaskPaper>
  );
}

FullScreenRequest.propTypes = {
  onFullScreen: PropTypes.func.isRequired
};
