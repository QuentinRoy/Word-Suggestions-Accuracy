import { useLayoutEffect } from "react";

const useBodyBackgroundColor = color => {
  useLayoutEffect(() => {
    const prevBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = color;
    return () => {
      document.body.style.backgroundColor = prevBackgroundColor;
    };
  }, [color]);
};

export default useBodyBackgroundColor;
