import { useState, useEffect } from "react";

const useIsFullScreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(document.fullscreen);

  useEffect(() => {
    const handler = () => {
      setIsFullScreen(document.fullscreen);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
    };
  }, []);

  return isFullScreen;
};

export default useIsFullScreen;
