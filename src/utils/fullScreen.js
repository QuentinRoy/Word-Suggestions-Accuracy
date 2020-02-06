import { useState, useEffect } from "react";

export const isFullScreen = () =>
  document.fullscreen || document.webkitIsFullScreen;

export const listenToFullScreenChange = handler => {
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
};

export const stopListeningToFullScreenChange = handler => {
  document.removeEventListener("fullscreenchange", handler);
  document.removeEventListener("webkitfullscreenchange", handler);
};

const nativeRequestFullscreen =
  document.documentElement.requestFullscreen ||
  document.documentElement.webkitRequestFullscreen;

export const requestFullScreen = () => {
  const resp = nativeRequestFullscreen.call(document.documentElement);
  if (resp != null && resp.then !== null) return resp;
  // Emulate the returned promise using full screen change events.
  return new Promise((resolve, reject) => {
    let timeoutId;
    const handler = () => {
      stopListeningToFullScreenChange(handler);
      clearTimeout(timeoutId);
      resolve();
    };
    timeoutId = setTimeout(() => {
      stopListeningToFullScreenChange(handler);
      reject(new Error("time out"));
    }, 5000);
    listenToFullScreenChange(handler);
  });
};

export const useIsFullScreen = onChange => {
  const [isFullScreenState, setIsFullScreen] = useState(isFullScreen());

  useEffect(() => {
    const handler = () => {
      setIsFullScreen(isFullScreen());
      if (onChange != null) onChange(isFullScreen());
    };
    listenToFullScreenChange(handler);
    return () => {
      stopListeningToFullScreenChange(handler);
    };
  }, [onChange]);

  return isFullScreenState;
};
