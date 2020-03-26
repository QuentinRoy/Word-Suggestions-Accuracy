import { useEffect, useState } from "react";

export default function useWindowFocus({ onFocus, onBlur }) {
  const [hasFocus, setHasFocus] = useState(document.hasFocus());
  // Monitor when the window is focused or blurred.
  useEffect(() => {
    const onFocusHandler = (evt) => {
      if (onFocus != null) onFocus(evt);
      setHasFocus(true);
    };
    const onBlurHandler = (evt) => {
      if (onBlur != null) onBlur(evt);
      setHasFocus(false);
    };
    window.addEventListener("blur", onBlurHandler);
    window.addEventListener("focus", onFocusHandler);
    return () => {
      window.removeEventListener("blur", onBlurHandler);
      window.removeEventListener("focus", onFocusHandler);
    };
  }, [onFocus, onBlur]);
  return hasFocus;
}
