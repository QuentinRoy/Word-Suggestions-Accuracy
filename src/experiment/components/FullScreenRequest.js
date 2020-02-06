import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import styles from "./styles/FullScreenRequest.module.css";
import { useIsFullScreen, requestFullScreen } from "../../utils/fullScreen";

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
    return null;
  }
  return (
    <>
      <p>The app need to be in full screen to work properly.</p>
      <p>
        <Button
          variant="contained"
          color="primary"
          disabled={isClicked}
          onClick={() => {
            setIsClicked(true);
            requestFullScreen()
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
    </>
  );
}

FullScreenRequest.propTypes = {
  onFullScreen: PropTypes.func
};

FullScreenRequest.defaultProps = {
  onFullScreen: () => {}
};
