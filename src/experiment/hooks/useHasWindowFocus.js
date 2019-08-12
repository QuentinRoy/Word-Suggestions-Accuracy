import { useState, useEffect } from "react";

const useHasWindowFocus = () => {
  const [hasWindowFocus, setHasWindowFocus] = useState(document.hasFocus());

  useEffect(() => {
    const onWindowBlurred = () => {
      setHasWindowFocus(false);
    };
    const onWindowFocused = () => {
      setHasWindowFocus(true);
    };
    window.addEventListener("blur", onWindowBlurred);
    window.addEventListener("focus", onWindowFocused);
    return () => {
      window.removeEventListener("blur", onWindowBlurred);
      window.removeEventListener("focus", onWindowFocused);
    };
  }, []);

  return hasWindowFocus;
};

export default useHasWindowFocus;
