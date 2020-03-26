import { useEffect, useState } from "react";

const useWindowSize = (
  initialWidth = window.innerWidth,
  initialHeight = window.innerHeight
) => {
  const [state, setState] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    const handler = () => {
      setState({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return state;
};

export default useWindowSize;
